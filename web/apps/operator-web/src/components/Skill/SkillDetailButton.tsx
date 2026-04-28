import { Button, message } from 'antd';
import { useState, type FC } from 'react';
import { putSkillStatus } from '@/apis/agent-operator-integration';
import { confirmModal } from '@/utils/modal';
import { useMicroWidgetProps } from '@/hooks';
import PermConfigMenu from '@/components/OperatorList/PermConfigMenu';
import { PublishedPermModal } from '@/components/OperatorList/PublishedPermModal';
import {
  OperatorStatusType,
  OperatorTypeEnum,
  PermConfigShowType,
  PermConfigTypeEnum,
} from '@/components/OperatorList/types';

const SkillDetailButton: FC<{
  detailInfo: any;
  fetchInfo: () => void;
  permissionCheckInfo: Array<PermConfigTypeEnum>;
  goBack: () => void;
}> = ({ detailInfo, fetchInfo, permissionCheckInfo, goBack }) => {
  const microWidgetProps = useMicroWidgetProps();
  const [buttonLoading, setButtonLoading] = useState(false);

  const handleStatus = async (status: string, successText: string) => {
    setButtonLoading(true);
    try {
      await putSkillStatus(detailInfo?.skill_id, { status });
      message.success(successText);
      fetchInfo?.();
      if (status === OperatorStatusType.Published && permissionCheckInfo?.includes(PermConfigTypeEnum.Authorize)) {
        PublishedPermModal({ record: detailInfo, activeTab: OperatorTypeEnum.Skill }, microWidgetProps);
      }
    } catch (error: any) {
      if (error?.description) {
        message.error(error.description);
      }
    } finally {
      setButtonLoading(false);
    }
  };

  const showOfflineConfirm = () => {
    confirmModal({
      title: '下架Skill',
      content: '下架后，引用了该Skill的智能体或工作流会失效，此操作不可撤回。',
      onOk() {
        handleStatus(OperatorStatusType.Offline, '下架成功');
      },
      onCancel() {},
    });
  };

  return (
    <>
      {permissionCheckInfo?.includes(PermConfigTypeEnum.Authorize) && (
        <PermConfigMenu
          params={{ record: detailInfo, activeTab: OperatorTypeEnum.Skill }}
          type={PermConfigShowType.Button}
        />
      )}
      {detailInfo?.status !== OperatorStatusType.Published &&
        permissionCheckInfo?.includes(PermConfigTypeEnum.Publish) && (
          <Button
            type="primary"
            variant="filled"
            loading={buttonLoading}
            onClick={() => handleStatus(OperatorStatusType.Published, '发布成功')}
          >
            发布
          </Button>
        )}
      {detailInfo?.status === OperatorStatusType.Published &&
        permissionCheckInfo?.includes(PermConfigTypeEnum.Unpublish) && (
          <Button color="danger" variant="filled" loading={buttonLoading} onClick={showOfflineConfirm}>
            下架
          </Button>
        )}
    </>
  );
};

export default SkillDetailButton;
