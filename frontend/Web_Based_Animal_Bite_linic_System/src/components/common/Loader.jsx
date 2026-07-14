export default function Loader({ size = 40, text = 'Loading...' }) {
  return (
    <div className="loader-container">
      <div className="loader" style={{ width: size, height: size }}></div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
}
