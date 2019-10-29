import React, { useRef } from 'react';
import 'balloon-css';


const Copyable: React.FC<{
  copyText: string,
  popupMessage?: string,
  popupDuration?: number,
}> = ({copyText, popupMessage, popupDuration, children}) => {
  let message = popupMessage ? popupMessage : 'Copied to clipboard!';
  let duration = popupDuration ? popupDuration : 1000;
  const textAreaRef = useRef(null);

  function copyToClipboard(element: React.MouseEvent) {
    textAreaRef.current.select();
    document.execCommand('copy');
    element.currentTarget.setAttribute('aria-label', message);
    element.currentTarget.setAttribute('data-balloon-visible', '');
    element.currentTarget.setAttribute('data-balloon-pos', "down");
    setTimeout((element) => {
      element.removeAttribute('aria-label');
    }, duration, element.currentTarget);
  }

  return <div onClick={(e) => copyToClipboard(e)}>
    {children}
    <form style={{height : '0'}}>
      <textarea 
        readOnly
        style={{height: '0.1px', padding: '0px', border: '0px'}} // Hacky way of hiding textarea
        ref={textAreaRef}
        value={copyText} />
    </form>
  </div>;
}

export default Copyable;