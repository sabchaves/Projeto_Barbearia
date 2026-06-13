import { useEffect } from 'react';

const useDocumentTitle = (title) => {
  useEffect(() => {
    document.title = `${title} | Cabeludo's`;
  }, [title]);
};

export default useDocumentTitle;
