import React from 'react'
import PropTypes from 'prop-types'
import Web3 from 'web3'
import Component from '@reactions/component'

const EthereumContext = React.createContext()

const deployContract = async (web3, contract) => {
  return await new web3.eth.Contract(contract.ABI, contract.address)
}

const EthereumProvider = ({
  contracts = [],
  children,
  network = 'https://ropsten.infura.io/'
}) => (
  <EthereumContext.Consumer>
    {() => (
      <Component
        initialState={{
          network,
          connected: false,
          web3: undefined,
          accounts: { loading: true, addresses: [] },
          monitorErrors: [],
          contracts,
          deployedContracts: []
        }}
        didMount={({ state, setState }) => {
          window.addEventListener('load', () => {
            if (window.web3) {
              const provider = state.network
              const web3 = new Web3(
                new window.web3.providers.HttpProvider(provider)
              )
              // Save Web3 State
              const web3State = { connected: true, web3 }
              setState({ ...web3State })

              // Deploy Contracts
              let deployedContracts = {}
              state.contracts.map(async c => {
                const contract = await deployContract(web3, c)
                deployedContracts = { ...deployedContracts, [c.name]: contract }
              })

              // Get available Accounts
              window.web3.eth.getAccounts((err, addresses) => {
                const accounts = {
                  loading: false,
                  addresses,
                  locked: !addresses.length
                }
                setState({ accounts, deployedContracts })
              })
            } else {
              setState({
                monitorErrors: [...state.monitorErrors, 'Not found web3']
              })
            }
          })
        }}
        render={({ state }) => {
          const {
            connected,
            web3,
            accounts,
            monitorErrors,
            contracts,
            deployedContracts
          } = state
          return children({
            connected,
            web3,
            accounts,
            monitorErrors,
            contracts,
            deployedContracts
          })
        }}
      />
    )}
  </EthereumContext.Consumer>
)

EthereumProvider.propTypes = {
  children: PropTypes.any.isRequired,
  contracts: PropTypes.array,
  network: PropTypes.string
}

export { EthereumProvider }
