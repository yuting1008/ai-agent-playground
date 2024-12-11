export function modalStyles({ isNightMode }: { isNightMode: boolean }) {
  return {
    backdrop: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      backgroundColor: 'rgba(0,0,0,0.5)',
      wordBreak: 'break-all',
      scrollbarColor: isNightMode
        ? 'rgba(0, 0, 0, 0.5) transparent'
        : 'transparent',
    } as React.CSSProperties,
    modal: {
      borderRadius: '4px',
      width: '80%',
      maxHeight: '80%',
      overflowY: 'auto',
      boxShadow: '0 0 10px rgba(0,0,0,0.3)',
      position: 'relative',
    } as React.CSSProperties,
    header: {
      padding: '10px 15px',
      borderBottom: '1px solid #ccc',
      display: 'flex',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      backgroundColor: isNightMode ? '#222' : 'white',
      zIndex: 1,
    } as React.CSSProperties,
    closeBtn: {
      background: 'none',
      border: 'none',
      fontSize: '16px',
      cursor: 'pointer',
    } as React.CSSProperties,
    tabs: {
      display: 'flex',
      borderBottom: '1px solid #ccc',
    } as React.CSSProperties,
    tab: {
      padding: '10px 15px',
      cursor: 'pointer',
      border: 'none',
      marginRight: '5px',
      backgroundColor: 'transparent',
    } as React.CSSProperties,
    activeTab: {
      padding: '10px 15px',
      cursor: 'pointer',
      border: 'none',
      marginRight: '5px',
      fontWeight: 'bold',
      backgroundColor: 'transparent',
    } as React.CSSProperties,
    content: {
      padding: '20px',
    } as React.CSSProperties,
  };
}
