const LoadingSpinner = () => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Wait, Loading...</p>
        <div className="loading-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <p className="progress-text">Analyzing website content</p>
        </div>
      </div>
    </div>
  )
}

export default LoadingSpinner
