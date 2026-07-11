import { useRouter } from 'next/router';

export function useBackOrClose() {
  const router = useRouter();

  const handleBackOrClose = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      window.close();
    }
  };

  return handleBackOrClose;
}
