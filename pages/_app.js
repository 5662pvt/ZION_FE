import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import '@/styles/qlbv.css';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { ToastContainer } from 'react-toastify';

export default function App({ Component, pageProps }) {
  return (
    <ConfigProvider locale={viVN}>
      <Component {...pageProps} />
      <ToastContainer theme="colored" position="top-right" />
    </ConfigProvider>
  );
}
