import { useEffect } from "react";

export function useKey(key, action) {
  useEffect(
    function () {
      function close(e) {
        if (e.code.toLowerCase() === key.toLowerCase()) {
          action();
        }
      }
      document.addEventListener("keydown", close);
      return function () {
        document.removeEventListener("keydown", close);
      };
    },
    [action, key]
  );
}
