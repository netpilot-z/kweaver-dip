import { useEffect, useState } from 'react';
import type { UploadFile, UploadProps } from 'antd';
import { Form, Modal, Select, Upload, message } from 'antd';
import { CloudUploadOutlined } from '@ant-design/icons';
import { getOperatorCategory, postSkill } from '@/apis/agent-operator-integration';

const { Dragger } = Upload;

interface CreateSkillModalProps {
  onCancel: () => void;
  onOk: () => void;
}

export default function CreateSkillModal({ onCancel, onOk }: CreateSkillModalProps) {
  const [category, setCategory] = useState('');
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategoryOptions = async () => {
      try {
        const data = await getOperatorCategory();
        setCategoryOptions(data || []);
        const defaultCategory =
          data?.find((item: any) => item?.name === '未分类')?.category_type ?? data?.[0]?.category_type ?? '';
        setCategory(defaultCategory);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCategoryOptions();
  }, []);

  const getImportType = (file?: File) => {
    if (!file) {
      return null;
    }

    const lowerCaseName = file.name.toLowerCase();
    if (lowerCaseName.endsWith('.zip')) {
      return 'zip';
    }

    if (lowerCaseName === 'skill.md') {
      return 'content';
    }

    return null;
  };

  const handleConfirm = async () => {
    const currentFile = fileList[0]?.originFileObj;
    if (!category) {
      message.info('请选择类型');
      return;
    }
    if (!currentFile) {
      message.info('请选择文件');
      return;
    }
    const importType = getImportType(currentFile);
    if (!importType) {
      message.info('仅支持导入 .zip 文件或 SKILL.md 文件');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', currentFile);
      formData.append('file_type', importType);
      formData.append('category', category);
      await postSkill(formData);
      message.success('导入 Skill 成功');
      onOk();
    } catch (error: any) {
      if (error?.description) {
        message.error(error.description);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBeforeUpload: UploadProps['beforeUpload'] = file => {
    if (!getImportType(file as File)) {
      message.info('仅支持导入 .zip 文件或 SKILL.md 文件');
      return Upload.LIST_IGNORE;
    }

    return false;
  };

  return (
    <Modal
      open
      centered
      width={640}
      title="导入Skill"
      okText="确定"
      cancelText="取消"
      maskClosable={false}
      confirmLoading={submitting}
      okButtonProps={{ className: 'dip-w-74' }}
      cancelButtonProps={{ className: 'dip-w-74' }}
      onCancel={onCancel}
      onOk={handleConfirm}
      footer={(_, { OkBtn, CancelBtn }) => (
        <>
          <OkBtn />
          <CancelBtn />
        </>
      )}
    >
      <Form layout="vertical">
        <Form.Item label="类型" required>
          <Select
            value={category}
            placeholder="请选择类型"
            options={categoryOptions?.map((item: any) => ({
              label: item.name,
              value: item.category_type,
            }))}
            onChange={setCategory}
          />
        </Form.Item>
        <Form.Item label="文件" required>
          <Dragger
            accept=".zip,.md"
            maxCount={1}
            beforeUpload={handleBeforeUpload}
            fileList={fileList}
            onChange={({ fileList: nextFileList }) => setFileList(nextFileList.slice(-1))}
          >
            <div style={{ height: 206 }} className="dip-flex-column-center dip-gap-8">
              <CloudUploadOutlined className="dip-font-24" />
              <p style={{ color: 'rgb(102, 102, 102)' }}>点击或拖拽上传 .zip 文件或 SKILL.md 文件。</p>
            </div>
          </Dragger>
        </Form.Item>
      </Form>
    </Modal>
  );
}
