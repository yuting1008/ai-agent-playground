export function componentLoadingStyles({
  isNightMode,
}: {
  isNightMode: boolean;
}) {
  return {
    camLoading: {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      width: '100%',
      height: '100%',
      fontSize: '20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    } as React.CSSProperties,

    spinner: {
      width: '40px',
      height: '40px',
      border: isNightMode
        ? '3px solid rgba(0, 0, 0, 0.4)'
        : '3px solid rgba(0, 0, 0, 0.2)',
      borderTop: isNightMode ? '3px solid #fffefe' : '3px solid #000000',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      padding: '50px',
      margin: '30px',
    } as React.CSSProperties,
  };
}
