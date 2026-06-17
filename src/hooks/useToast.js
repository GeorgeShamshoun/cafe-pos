import React from "react";

export const useToast = () => {
  const [toast, setToast] = React.useState(null);

  const showToast = React.useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  }, []);

  return { toast, showToast };
};
