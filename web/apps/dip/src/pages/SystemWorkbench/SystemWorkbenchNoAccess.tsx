import { Result } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NoAccessIcon from '@/assets/images/abnormal/403.svg?react';
import { useGlobalLayoutStore } from '@/stores/globalLayoutStore';

const REDIRECT_SECONDS = 5;

/**
 * 无系统工作台权限：说明 + 倒计时后回到应用根路径（由路由解析到默认首页）
 */
const SystemWorkbenchNoAccess = () => {
  const navigate = useNavigate();
  const setSystemWorkbenchNoAccessUi = useGlobalLayoutStore(s => s.setSystemWorkbenchNoAccessUi);
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    setSystemWorkbenchNoAccessUi(true);
    return () => setSystemWorkbenchNoAccessUi(false);
  }, [setSystemWorkbenchNoAccessUi]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      navigate('/', { replace: true });
      return;
    }
    const t = window.setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [secondsLeft, navigate]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Result
        icon={<NoAccessIcon />}
        title="暂无权限"
        subTitle={
          <div className="flex flex-col items-center gap-2 text-base text-[--dip-text-color-65]">
            <span>系统工作台仅管理员可使用，当前账号无法访问。</span>
            <span className="text-sm text-[--dip-text-color-45]">
              {secondsLeft > 0 ? `${secondsLeft} 秒后自动返回首页` : '正在跳转…'}
            </span>
          </div>
        }
      />
    </div>
  );
};

export default SystemWorkbenchNoAccess;
