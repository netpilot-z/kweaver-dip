
# Default DIP namespace
DIP_NAMESPACE="${DIP_NAMESPACE:-kweaver-ai}"

# Default local DIP charts directory (relative to deploy root)
DIP_LOCAL_CHARTS_DIR="${DIP_LOCAL_CHARTS_DIR:-}"
DIP_VERSION_MANIFEST_FILE="${DIP_VERSION_MANIFEST_FILE:-}"

# Parse dip command arguments
parse_dip_args() {
    local action="$1"
    shift

    # Parse arguments to override defaults
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --version=*)
                HELM_CHART_VERSION="${1#*=}"
                shift
                ;;
            --version)
                HELM_CHART_VERSION="$2"
                shift 2
                ;;
            --helm_repo=*)
                HELM_CHART_REPO_URL="${1#*=}"
                shift
                ;;
            --helm_repo)
                HELM_CHART_REPO_URL="$2"
                shift 2
                ;;
            --helm_repo_name=*)
                HELM_CHART_REPO_NAME="${1#*=}"
                shift
                ;;
            --helm_repo_name)
                HELM_CHART_REPO_NAME="$2"
                shift 2
                ;;
            --charts_dir=*)
                DIP_LOCAL_CHARTS_DIR="${1#*=}"
                shift
                ;;
            --charts_dir)
                DIP_LOCAL_CHARTS_DIR="$2"
                shift 2
                ;;
            --version_file=*)
                DIP_VERSION_MANIFEST_FILE="${1#*=}"
                shift
                ;;
            --version_file)
                DIP_VERSION_MANIFEST_FILE="$2"
                shift 2
                ;;
            --force-refresh)
                FORCE_REFRESH_CHARTS="true"
                shift
                ;;
            --namespace=*)
                DIP_NAMESPACE="${1#*=}"
                shift
                ;;
            --namespace)
                DIP_NAMESPACE="$2"
                shift 2
                ;;
            --config=*)
                CONFIG_YAML_PATH="${1#*=}"
                shift
                ;;
            --config)
                CONFIG_YAML_PATH="$2"
                shift 2
                ;;
            *)
                log_error "Unknown argument: $1"
                return 1
                ;;
        esac
    done
}

# Check if a single Helm release is deployed in the given namespace
_dip_helm_release_exists() {
    local release="$1"
    local ns="$2"
    helm list -n "${ns}" --short 2>/dev/null | grep -q "^${release}$"
}

# Ensure kweaver-core modules are installed.
_dip_ensure_kweaver_core() {
    _dip_require_version_manifest || return 1

    local namespace
    namespace=$(grep "^namespace:" "${CONFIG_YAML_PATH}" 2>/dev/null | head -1 | awk '{print $2}' | tr -d "'\"")
    namespace="${namespace:-kweaver-ai}"

    log_info "Checking kweaver-core dependencies for KWeaver DIP..."

    local missing_isf=false
    local missing_core=false
    local release_name
    local original_chart_version="${HELM_CHART_VERSION:-}"
    local original_core_manifest="${CORE_VERSION_MANIFEST_FILE:-}"
    local original_isf_manifest="${ISF_VERSION_MANIFEST_FILE:-}"
    local core_dependency_manifest=""
    local core_dependency_version="${HELM_CHART_VERSION:-}"
    local isf_dependency_manifest=""
    local isf_dependency_version="${HELM_CHART_VERSION:-}"

    core_dependency_manifest="$(_dip_resolve_core_dependency_manifest)"
    core_dependency_version="$(_dip_resolve_core_dependency_version)"
    isf_dependency_manifest="$(_dip_resolve_isf_dependency_manifest)"
    isf_dependency_version="$(_dip_resolve_isf_dependency_version)"

    local -a isf_release_names=()
    mapfile -t isf_release_names < <(_dip_list_manifest_release_names "isf" "${isf_dependency_manifest}" "${isf_dependency_version}")
    local -a core_release_names=()
    mapfile -t core_release_names < <(_dip_list_manifest_release_names "kweaver-core" "${core_dependency_manifest}" "${core_dependency_version}")

    for release_name in "${isf_release_names[@]}"; do
        if _dip_helm_release_exists "${release_name}" "${namespace}"; then
            log_info "  ✓ ISF release already installed (${release_name})"
        else
            log_info "  ✗ ISF release not installed (${release_name})"
            missing_isf=true
        fi
    done

    for release_name in "${core_release_names[@]}"; do
        if _dip_helm_release_exists "${release_name}" "${namespace}"; then
            log_info "  ✓ Core release already installed (${release_name})"
        else
            log_info "  ✗ Core release not installed (${release_name})"
            missing_core=true
        fi
    done

    if [[ "${missing_isf}" == "true" ]]; then
        if [[ -n "${isf_dependency_manifest}" ]]; then
            ISF_VERSION_MANIFEST_FILE="${isf_dependency_manifest}"
            HELM_CHART_VERSION="${isf_dependency_version}"
        fi
        if ! install_isf; then
            HELM_CHART_VERSION="${original_chart_version}"
            CORE_VERSION_MANIFEST_FILE="${original_core_manifest}"
            ISF_VERSION_MANIFEST_FILE="${original_isf_manifest}"
            log_error "Failed to install kweaver-core module: ISF"
            return 1
        fi
        HELM_CHART_VERSION="${original_chart_version}"
        CORE_VERSION_MANIFEST_FILE="${original_core_manifest}"
        ISF_VERSION_MANIFEST_FILE="${original_isf_manifest}"
    fi

    if [[ "${missing_core}" == "true" ]]; then
        log_info "Installing missing KWeaver Core releases..."
        if [[ -n "${core_dependency_manifest}" ]]; then
            CORE_VERSION_MANIFEST_FILE="${core_dependency_manifest}"
            HELM_CHART_VERSION="${core_dependency_version}"
        fi
        if ! install_core; then
            HELM_CHART_VERSION="${original_chart_version}"
            CORE_VERSION_MANIFEST_FILE="${original_core_manifest}"
            ISF_VERSION_MANIFEST_FILE="${original_isf_manifest}"
            log_error "Failed to install missing KWeaver Core releases"
            return 1
        fi
        HELM_CHART_VERSION="${original_chart_version}"
        CORE_VERSION_MANIFEST_FILE="${original_core_manifest}"
        ISF_VERSION_MANIFEST_FILE="${original_isf_manifest}"
    fi

    if [[ "${missing_isf}" == "false" && "${missing_core}" == "false" ]]; then
        log_info "All kweaver-core dependencies are satisfied."
    else
        log_info "kweaver-core dependency installation completed."
    fi
}

# Resolve the local charts directory for install-time local chart usage.
# Only an explicit --charts_dir opt-in enables local chart installs.
_dip_resolve_charts_dir() {
    if [[ -n "${DIP_LOCAL_CHARTS_DIR}" ]]; then
        if [[ -d "${DIP_LOCAL_CHARTS_DIR}" ]]; then
            echo "${DIP_LOCAL_CHARTS_DIR}"
        fi
    fi
}

_dip_download_charts_dir() {
    if [[ -n "${DIP_LOCAL_CHARTS_DIR}" ]]; then
        ensure_charts_dir "${DIP_LOCAL_CHARTS_DIR}"
        return 0
    fi

    ensure_charts_dir "$(resolve_shared_charts_dir)"
}

_dip_auto_resolve_version_manifest() {
    if [[ -n "${DIP_VERSION_MANIFEST_FILE:-}" ]]; then
        return 0
    fi

    local embedded_manifest
    if [[ -n "${HELM_CHART_VERSION:-}" ]]; then
        embedded_manifest="$(resolve_embedded_release_manifest "kweaver-dip" "${HELM_CHART_VERSION}")"
    else
        embedded_manifest="$(resolve_latest_embedded_release_manifest "kweaver-dip")"
    fi
    if [[ -n "${embedded_manifest}" ]]; then
        DIP_VERSION_MANIFEST_FILE="${embedded_manifest}"
    fi
}

_dip_require_version_manifest() {
    _dip_auto_resolve_version_manifest

    if [[ -z "${DIP_VERSION_MANIFEST_FILE:-}" ]]; then
        log_error "No release manifest found for kweaver-dip. Provide --version or --version_file."
        return 1
    fi
}

_dip_resolve_release_version() {
    local release_name="$1"
    _dip_require_version_manifest || return 1
    resolve_release_chart_version "${DIP_VERSION_MANIFEST_FILE:-}" "kweaver-dip" "${HELM_CHART_VERSION:-}" "${release_name}" "${HELM_CHART_VERSION:-}"
}

_dip_resolve_chart_name() {
    local release_name="$1"
    _dip_require_version_manifest || return 1
    resolve_release_chart_name "${DIP_VERSION_MANIFEST_FILE:-}" "kweaver-dip" "${HELM_CHART_VERSION:-}" "${release_name}" "${release_name}"
}

_dip_resolve_release_stage() {
    local release_name="$1"
    _dip_require_version_manifest || return 1
    get_release_manifest_release_stage "${DIP_VERSION_MANIFEST_FILE}" "kweaver-dip" "${HELM_CHART_VERSION:-}" "${release_name}"
}

_dip_release_names() {
    _dip_require_version_manifest || return 1

    local -a manifest_release_names=()
    mapfile -t manifest_release_names < <(get_release_manifest_release_names "${DIP_VERSION_MANIFEST_FILE}" "kweaver-dip" "${HELM_CHART_VERSION:-}")

    local stage
    local release_name
    local release_stage
    for stage in pre main post; do
        for release_name in "${manifest_release_names[@]}"; do
            release_stage="$(_dip_resolve_release_stage "${release_name}")" || return 1
            if [[ "${release_stage}" == "${stage}" ]]; then
                printf '%s\n' "${release_name}"
            fi
        done
    done
}

_dip_release_names_reverse() {
    local -a ordered_release_names=()
    mapfile -t ordered_release_names < <(_dip_release_names)

    local i
    for ((i=${#ordered_release_names[@]}-1; i>=0; i--)); do
        printf '%s\n' "${ordered_release_names[$i]}"
    done
}

_dip_resolve_core_dependency_version() {
    _dip_require_version_manifest || return 1
    get_release_manifest_dependency_version "${DIP_VERSION_MANIFEST_FILE}" "kweaver-core"
}

_dip_resolve_core_dependency_manifest() {
    _dip_require_version_manifest || return 1
    get_release_manifest_dependency_manifest "${DIP_VERSION_MANIFEST_FILE}" "kweaver-core"
}

_dip_has_direct_dependency() {
    local dependency_product="$1"

    _dip_require_version_manifest || return 1

    [[ -n "$(_manifest_strip_quotes "$(_manifest_read_dependency_field "${DIP_VERSION_MANIFEST_FILE}" "${dependency_product}" "version")")" ]]
}

_dip_resolve_isf_dependency_version() {
    _dip_require_version_manifest || return 1

    if _dip_has_direct_dependency "isf"; then
        get_release_manifest_dependency_version "${DIP_VERSION_MANIFEST_FILE}" "isf"
        return 0
    fi

    local core_manifest
    core_manifest="$(_dip_resolve_core_dependency_manifest)"
    if [[ -n "${core_manifest}" ]]; then
        get_release_manifest_dependency_version "${core_manifest}" "isf"
        return 0
    fi

    echo "${HELM_CHART_VERSION:-}"
}

_dip_resolve_isf_dependency_manifest() {
    _dip_require_version_manifest || return 1

    if _dip_has_direct_dependency "isf"; then
        get_release_manifest_dependency_manifest "${DIP_VERSION_MANIFEST_FILE}" "isf"
        return 0
    fi

    local core_manifest
    core_manifest="$(_dip_resolve_core_dependency_manifest)"
    if [[ -n "${core_manifest}" ]]; then
        get_release_manifest_dependency_manifest "${core_manifest}" "isf"
    fi
}

_dip_list_manifest_release_names() {
    local product="$1"
    local manifest_file="${2:-}"
    local aggregate_version="${3:-}"

    if [[ -z "${manifest_file}" ]]; then
        if [[ -n "${aggregate_version}" ]]; then
            manifest_file="$(resolve_embedded_release_manifest "${product}" "${aggregate_version}")"
        else
            manifest_file="$(resolve_latest_embedded_release_manifest "${product}")"
        fi
    fi

    if [[ -z "${manifest_file}" ]]; then
        log_error "No release manifest found for dependency product: ${product}"
        return 1
    fi

    get_release_manifest_release_names "${manifest_file}" "${product}" "${aggregate_version}"
}

# Find a local tgz for a chart name inside a directory (picks the first match)
_dip_find_local_chart() {
    local charts_dir="$1"
    local chart_name="$2"
    find_cached_chart_tgz "${charts_dir}" "${chart_name}"
}

_dip_show_access_hints() {
    local base_url
    base_url="$(get_access_address_base_url)"
    if [[ -z "${base_url}" ]]; then
        return 0
    fi

    log_info "Access KWeaver deploy console: ${base_url}/deploy"
    log_info "Access KWeaver studio: ${base_url}/studio"
    log_info "Access KWeaver dip-hub: ${base_url}/dip-hub"
}

_dip_append_release_extra_helm_args() {
    local release_name="$1"
    local target_array_name="$2"

    # Apply values from manifest if exists
    if [[ -n "${DIP_VERSION_MANIFEST_FILE:-}" && -f "${DIP_VERSION_MANIFEST_FILE}" ]]; then
        apply_release_manifest_values "${DIP_VERSION_MANIFEST_FILE}" "kweaver-dip" "${HELM_CHART_VERSION:-}" "${release_name}" "${target_array_name}" || return 1
    fi

    return 0
}

init_dip_database() {
    local sql_dir
    sql_dir="$(resolve_versioned_sql_dir "kweaver-dip" "${HELM_CHART_VERSION:-}")"

    if ! is_rds_internal; then
        warn_external_rds_sql_required "KWeaver DIP" "${sql_dir}"
        log_warn "Skipping automatic KWeaver DIP database initialization (external RDS)"
        return 0
    fi

    init_module_database_if_present "kweaver-dip" "${sql_dir}" "KWeaver DIP"
}

# Install DIP services via Helm
install_dip() {
    log_info "Installing KWeaver DIP services via Helm..."
    _dip_require_version_manifest || return 1

    local charts_dir
    charts_dir="$(_dip_resolve_charts_dir)"

    local use_local=false
    if [[ -n "${charts_dir}" && -d "${charts_dir}" ]]; then
        use_local=true
        CORE_LOCAL_CHARTS_DIR="${charts_dir}"
        ISF_LOCAL_CHARTS_DIR="${charts_dir}"
        log_info "Using local DIP charts from: ${charts_dir}"
    fi

    if ! ensure_platform_prerequisites; then
        log_error "Failed to ensure platform prerequisites for KWeaver DIP"
        return 1
    fi

    # Ensure kweaver-core dependencies are installed
    if ! _dip_ensure_kweaver_core; then
        log_error "kweaver-core dependency check/installation failed"
        return 1
    fi

    if ! init_dip_database; then
        log_error "Failed to initialize KWeaver DIP database"
        return 1
    fi

    # Resolve namespace
    local namespace
    namespace=$(grep "^namespace:" "${CONFIG_YAML_PATH}" 2>/dev/null | head -1 | awk '{print $2}' | tr -d "'\"")
    namespace="${namespace:-${DIP_NAMESPACE}}"

    # Create namespace if not exists
    kubectl create namespace "${namespace}" 2>/dev/null || true

    # Resolve chart source: local directory takes priority over remote repo
    if [[ "${use_local}" != "true" ]]; then
        if [[ -z "${HELM_CHART_REPO_NAME}" ]]; then
            HELM_CHART_REPO_NAME="kweaver"
        fi
        log_info "No explicit local DIP charts directory provided, using Helm repo."
        log_info "  Version:   ${HELM_CHART_VERSION:-latest}"
        if [[ -n "${DIP_VERSION_MANIFEST_FILE:-}" ]]; then
            log_info "  Version Manifest: ${DIP_VERSION_MANIFEST_FILE}"
        fi
        log_info "  Helm Repo: ${HELM_CHART_REPO_NAME} -> ${HELM_CHART_REPO_URL}"
        ensure_helm_repo "${HELM_CHART_REPO_NAME}" "${HELM_CHART_REPO_URL}"
    fi

    log_info "Target namespace: ${namespace}"

    local release_name
    local release_version
    local chart_name
    while IFS= read -r release_name; do
        [[ -n "${release_name}" ]] || continue
        release_version="$(_dip_resolve_release_version "${release_name}")"
        chart_name="$(_dip_resolve_chart_name "${release_name}")"
        if [[ "${use_local}" == "true" ]]; then
            _install_dip_release_local "${release_name}" "${charts_dir}" "${namespace}"
        else
            _install_dip_release_repo "${release_name}" "${chart_name}" "${namespace}" "${HELM_CHART_REPO_NAME}" "${release_version}"
        fi
    done < <(_dip_release_names)

    log_info "KWeaver DIP services installation completed."
    
    # Install Etrino services (vega-hdfs, vega-calculate, vega-metadata)
    log_info "Installing Etrino services..."
    local etrino_script="${SCRIPT_DIR}/scripts/services/etrino.sh"
    if [[ -f "${etrino_script}" ]]; then
        NAMESPACE="${namespace}" CONFIG_FILE="${CONFIG_YAML_PATH}" bash "${etrino_script}" || {
            log_warn "Etrino installation encountered issues, but continuing..."
        }
    else
        log_warn "Etrino installation script not found at ${etrino_script}, skipping..."
    fi
    
    _dip_show_access_hints
}

download_dip() {
    log_info "Downloading KWeaver DIP charts..."
    ensure_helm_available
    _dip_require_version_manifest || return 1

    HELM_CHART_REPO_NAME="${HELM_CHART_REPO_NAME:-kweaver}"
    HELM_CHART_REPO_URL="${HELM_CHART_REPO_URL:-https://kweaver-ai.github.io/helm-repo/}"

    local charts_dir
    charts_dir="$(_dip_download_charts_dir)"

    local original_core_charts_dir="${CORE_LOCAL_CHARTS_DIR:-}"
    local original_isf_charts_dir="${ISF_LOCAL_CHARTS_DIR:-}"
    local original_enable_isf="${ENABLE_ISF:-}"
    local original_chart_version="${HELM_CHART_VERSION:-}"
    local original_core_manifest="${CORE_VERSION_MANIFEST_FILE:-}"
    CORE_LOCAL_CHARTS_DIR="${charts_dir}"
    ISF_LOCAL_CHARTS_DIR="${charts_dir}"
    ENABLE_ISF="true"

    ensure_helm_repo "${HELM_CHART_REPO_NAME}" "${HELM_CHART_REPO_URL}"
    if [[ -n "${DIP_VERSION_MANIFEST_FILE:-}" ]]; then
        CORE_VERSION_MANIFEST_FILE="$(_dip_resolve_core_dependency_manifest)"
        HELM_CHART_VERSION="$(_dip_resolve_core_dependency_version)"
    fi
    download_core
    HELM_CHART_VERSION="${original_chart_version}"
    CORE_VERSION_MANIFEST_FILE="${original_core_manifest}"

    local release_name
    while IFS= read -r release_name; do
        [[ -n "${release_name}" ]] || continue
        local release_version
        local chart_name
        release_version="$(_dip_resolve_release_version "${release_name}")"
        chart_name="$(_dip_resolve_chart_name "${release_name}")"
        download_chart_to_cache "${charts_dir}" "${HELM_CHART_REPO_NAME}" "${chart_name}" "${release_version}" "${FORCE_REFRESH_CHARTS:-false}"
    done < <(_dip_release_names)

    CORE_LOCAL_CHARTS_DIR="${original_core_charts_dir}"
    ISF_LOCAL_CHARTS_DIR="${original_isf_charts_dir}"
    ENABLE_ISF="${original_enable_isf}"
}

# Install a single DIP release from a local .tgz chart file
_install_dip_release_local() {
    local release_name="$1"
    local charts_dir="$2"
    local namespace="$3"
    local requested_version
    local chart_name

    requested_version="$(_dip_resolve_release_version "${release_name}")"
    chart_name="$(_dip_resolve_chart_name "${release_name}")"

    local chart_tgz=""
    if [[ -n "${requested_version}" ]]; then
        chart_tgz="$(find_cached_chart_tgz_by_version "${charts_dir}" "${chart_name}" "${requested_version}" || true)"
    fi
    if [[ -z "${chart_tgz}" ]]; then
        chart_tgz="$(_dip_find_local_chart "${charts_dir}" "${chart_name}")"
    fi

    if [[ -z "${chart_tgz}" ]]; then
        log_error "✗ Local chart not found for ${release_name} (${chart_name}) in ${charts_dir}"
        return 1
    fi

    local target_version
    target_version="${requested_version}"
    if [[ -z "${target_version}" ]]; then
        target_version="$(get_local_chart_version "${chart_tgz}")"
    fi
    if should_skip_upgrade_same_chart_version "${release_name}" "${namespace}" "${chart_name}" "${target_version}"; then
        return 0
    fi

    log_info "Installing ${release_name} from local chart: $(basename "${chart_tgz}")..."

    local -a helm_args=(
        "upgrade" "--install" "${release_name}"
        "${chart_tgz}"
        "--namespace" "${namespace}"
        "-f" "${CONFIG_YAML_PATH}"
        "--wait" "--timeout=600s"
    )

    _dip_append_release_extra_helm_args "${release_name}" helm_args || return 1

    if helm "${helm_args[@]}"; then
        log_info "✓ ${release_name} installed successfully"
    else
        log_error "✗ Failed to install ${release_name}"
        return 1
    fi
}

# Install a single DIP release from a Helm repository
_install_dip_release_repo() {
    local release_name="$1"
    local chart_name="$2"
    local namespace="$3"
    local helm_repo_name="$4"
    local release_version="$5"

    local target_version="${release_version}"
    if [[ -z "${target_version}" ]]; then
        target_version=$(get_repo_chart_latest_version "${helm_repo_name}" "${chart_name}")
    fi

    if should_skip_upgrade_same_chart_version "${release_name}" "${namespace}" "${chart_name}" "${target_version}"; then
        return 0
    fi

    # Clean up any pending state before installing
    local current_status
    current_status=$(helm status "${release_name}" -n "${namespace}" -o json 2>/dev/null | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [[ -n "${current_status}" && "${current_status}" != "deployed" && "${current_status}" != "failed" ]]; then
        log_info "Cleaning up ${release_name} (status: ${current_status})..."
        helm uninstall "${release_name}" -n "${namespace}" 2>/dev/null || true
    fi

    log_info "Installing ${release_name} from repo..."

    local chart_ref="${helm_repo_name}/${chart_name}"

    local -a helm_args=(
        "upgrade" "--install" "${release_name}"
        "${chart_ref}"
        "--namespace" "${namespace}"
        "-f" "${CONFIG_YAML_PATH}"
    )

    _dip_append_release_extra_helm_args "${release_name}" helm_args || return 1

    if [[ -n "${release_version}" ]]; then
        helm_args+=("--version" "${release_version}")
    fi

    helm_args+=("--devel" "--wait" "--timeout=600s")

    if helm "${helm_args[@]}"; then
        log_info "✓ ${release_name} installed successfully"
    else
        log_error "✗ Failed to install ${release_name}"
        return 1
    fi
}

# Uninstall DIP services
uninstall_dip() {
    log_info "Uninstalling KWeaver DIP services..."
    _dip_require_version_manifest || return 1

    local namespace
    namespace=$(grep "^namespace:" "${CONFIG_YAML_PATH}" 2>/dev/null | head -1 | awk '{print $2}' | tr -d "'\"")
    namespace="${namespace:-${DIP_NAMESPACE}}"

    # Uninstall in reverse install order
    local release_name
    while IFS= read -r release_name; do
        [[ -n "${release_name}" ]] || continue
        log_info "Uninstalling ${release_name}..."
        if helm uninstall "${release_name}" -n "${namespace}" 2>/dev/null; then
            log_info "✓ ${release_name} uninstalled successfully"
        else
            log_warn "⚠ ${release_name} not found or already uninstalled"
        fi
    done < <(_dip_release_names_reverse)

    log_info "KWeaver DIP services uninstallation completed."
}

# Show DIP services status
show_dip_status() {
    log_info "KWeaver DIP services status:"
    _dip_require_version_manifest || return 1

    local namespace
    namespace=$(grep "^namespace:" "${CONFIG_YAML_PATH}" 2>/dev/null | head -1 | awk '{print $2}' | tr -d "'\"")
    namespace="${namespace:-${DIP_NAMESPACE}}"

    log_info "Namespace: ${namespace}"
    log_info ""

    local release_name
    while IFS= read -r release_name; do
        [[ -n "${release_name}" ]] || continue
        if helm status "${release_name}" -n "${namespace}" >/dev/null 2>&1; then
            local status
            status=$(helm status "${release_name}" -n "${namespace}" -o json 2>/dev/null | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
            log_info "  ✓ ${release_name}: ${status}"
        else
            log_info "  ✗ ${release_name}: not installed"
        fi
    done < <(_dip_release_names)
}
