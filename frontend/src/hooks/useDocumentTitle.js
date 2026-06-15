//Um hook personalizado (função utilitária do React) que altera dinamicamente 
// o título da aba do navegador conforme a página que o usuário está navegando
//(ex: muda para "Dashboard | Cabeludo's" ou "Login | Cabeludo's").

import { useEffect } from 'react';

const useDocumentTitle = (title) => {
  useEffect(() => {
    document.title = `${title} | Cabeludo's`;
  }, [title]);
};

export default useDocumentTitle;
