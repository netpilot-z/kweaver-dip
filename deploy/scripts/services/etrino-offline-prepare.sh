#!/bin/bash
# Etrino Prepare Script
# 安装 etrino（vega-hdfs / vega-calculate / vega-metadata）前的节点前置动作：
#   1. 给节点打 aishu.io/hostname=nodeN 标签（vega-hdfs chart 的 nodeSelector 依赖）
#   2. 在对应节点上创建 hostPath 目录（vega-hdfs 本地 PV 依赖）
#
# 执行完后请用标准流程继续安装：
#   proton-cli app install -f <repo>/deploy/release-manifests/0.5.0/etrino.yaml -n <namespace>
#
# 用法：
#   ./etrino-prepare.sh                       # 自动给所有节点按索引打标签 + 建目录
#   ./etrino-prepare.sh --dry-run             # 只打印将执行的动作
#   ./etrino-prepare.sh --nodes node1,node2   # 仅处理指定节点（顺序即索引 0,1...）
#
# 幂等：重复执行不会产生副作用。
set -euo pipefail

DRY_RUN=false
NODES_FILTER=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run) DRY_RUN=true; shift ;;
        --nodes)   NODES_FILTER="$2"; shift 2 ;;
        -h|--help) sed -n '2,17p' "$0"; exit 0 ;;
        *) echo "Unknown option: $1" >&2; exit 2 ;;
    esac
done

run() {
    if [ "$DRY_RUN" = true ]; then
        echo "[dry-run] $*"
    else
        eval "$@"
    fi
}

# vega-hdfs values.yaml 里声明的 hostPath，按 nodeIndex 组织
# 与 packages/vega-hdfs/values.yaml 中 storage/storage_namenode/storage_slaves/storage_datanode 一致
declare -A DIRS_BY_INDEX=(
    [0]="/sysvol/journalnode /sysvol/namenode /sysvol/datanode"
    [1]="/sysvol/journalnode /sysvol/namenode /sysvol/datanode /sysvol/namenode-slaves"
    [2]="/sysvol/journalnode /sysvol/namenode /sysvol/datanode"
)

echo "==> Discovering nodes..."
if [ -n "$NODES_FILTER" ]; then
    IFS=',' read -ra NODES <<< "$NODES_FILTER"
else
    NODES=($(kubectl get nodes -o jsonpath='{.items[*].metadata.name}'))
fi
echo "   nodes: ${NODES[*]}"

# ---------- 1. 打节点标签 ----------
echo "==> Labeling nodes with aishu.io/hostname=nodeN..."
for i in "${!NODES[@]}"; do
    node="${NODES[$i]}"
    label="node${i}"
    cur=$(kubectl get node "$node" -o jsonpath='{.metadata.labels.aishu\.io/hostname}' 2>/dev/null || true)
    if [ "$cur" = "$label" ]; then
        echo "   [skip] $node already has aishu.io/hostname=$label"
    else
        run "kubectl label node $node aishu.io/hostname=$label --overwrite"
    fi
done

# ---------- 2. 创建 hostPath 目录 ----------
echo "==> Ensuring hostPath directories on target nodes..."
local_hostname="$(hostname)"
for i in "${!NODES[@]}"; do
    node="${NODES[$i]}"
    dirs="${DIRS_BY_INDEX[$i]:-}"
    [ -z "$dirs" ] && continue
    echo "   $node: $dirs"

    # 单节点或目标就是当前机器，直接本地 mkdir
    if [ "${#NODES[@]}" -eq 1 ] || [ "$node" = "$local_hostname" ]; then
        run "mkdir -p $dirs"
        continue
    fi

    # 多节点：优先通过 proton-agent DaemonSet pod 在目标节点上 mkdir，回退到 SSH
    agent_pod=$(kubectl -n kweaver get pod -l app=proton-agent \
        --field-selector spec.nodeName="$node" \
        -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || true)
    if [ -n "$agent_pod" ]; then
        run "kubectl -n kweaver exec $agent_pod -- mkdir -p $dirs"
    elif ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -o BatchMode=yes \
            "$node" "mkdir -p $dirs" 2>/dev/null; then
        [ "$DRY_RUN" = true ] || echo "   [ssh ok] $node"
    else
        echo "   WARNING: cannot reach $node via proton-agent or SSH."
        echo "            Please manually run on $node:  mkdir -p $dirs"
    fi
done

echo "==> etrino-prepare done."
echo "    Next step:"
echo "      proton-cli app install -f <repo>/deploy/release-manifests/0.5.0/etrino.yaml -n <namespace>"
