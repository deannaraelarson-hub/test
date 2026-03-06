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
    eligibility,
    eligibleNetworks,
    bestNetwork,
    relayerHealth,
    depositAmount,
    setDepositAmount,
    transactionStatus,
    checkEligibility,
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

          {/* Relayer Health */}
          {relayerHealth && (
            <div className="card health-card">
              <h2>⚙️ Relayer Status</h2>
              <div className="networks-grid">
                {relayerHealth.networks?.map((network) => (
                  <div 
                    key={network.network} 
                    className={`network-status ${network.status}`}
                  >
                    <span className="network-name">{network.network.toUpperCase()}</span>
                    {network.status === 'active' && (
                      <>
                        <span className="balance">
                          {parseFloat(network.balance).toFixed(4)} ETH
                        </span>
                        <span className="address-small">
                          {network.address?.slice(0, 6)}...
                        </span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Eligibility Check */}
          {isConnected && (
            <div className="card eligibility-card">
              <h2>✅ Eligibility Check</h2>
              {!eligibility ? (
                <button 
                  onClick={checkEligibility} 
                  className="button button-primary button-large"
                  disabled={loading}
                >
                  {loading ? 'Checking...' : 'Check Eligibility'}
                </button>
              ) : (
                <div className="eligibility-results">
                  <h3>Available Networks:</h3>
                  {eligibleNetworks.length > 0 ? (
                    <>
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
                                <span>Remaining:</span>
                                <strong>{parseFloat(network.remaining).toFixed(4)} {network.currency}</strong>
                              </div>
                              <div className="detail-row">
                                <span>Max:</span>
                                <span>{parseFloat(network.maxAllocation).toFixed(4)} {network.currency}</span>
                              </div>
                              <div className="detail-row">
                                <span>Min:</span>
                                <span>{parseFloat(network.minAllocation).toFixed(4)} {network.currency}</span>
                              </div>
                              <div className="detail-row">
                                <span>Deposited:</span>
                                <span>{parseFloat(network.deposited).toFixed(4)} {network.currency}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Deposit Form */}
                      {bestNetwork && (
                        <div className="deposit-form">
                          <h3>Make Deposit</h3>
                          <div className="best-network-info">
                            <p>Selected: <strong>{bestNetwork.networkName}</strong></p>
                            <p>Available: <strong>{parseFloat(bestNetwork.remaining).toFixed(4)} {bestNetwork.currency}</strong></p>
                            <p>Min: {parseFloat(bestNetwork.minAllocation).toFixed(4)} {bestNetwork.currency}</p>
                          </div>
                          
                          <div className="input-group">
                            <input
                              type="number"
                              placeholder={`Amount in ${bestNetwork.currency}`}
                              value={depositAmount}
                              onChange={(e) => setDepositAmount(e.target.value)}
                              min={bestNetwork.minAllocation}
                              max={bestNetwork.remaining}
                              step="0.01"
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
                    </>
                  ) : (
                    <div className="no-eligibility">
                      <p>You are not eligible on any network</p>
                      <button 
                        onClick={checkEligibility} 
                        className="button button-secondary"
                      >
                        Check Again
                      </button>
                    </div>
                  )}
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
                  View on Etherscan ↗
                </a>
              )}
            </div>
          )}
        </main>

        <footer className="footer">
          <p>MetaCollector • Powered by Reown AppKit & Relayer Network</p>
          <p className="api-key-hint">Relayer API: {relayerHealth ? '✅ Connected' : '⚠️ Checking...'}</p>
        </footer>
      </div>
    </div>
  )
}

export default App