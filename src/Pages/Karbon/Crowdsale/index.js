import React from 'react'
import isEqual from 'lodash/isEqual'
import PropTypes from 'prop-types'
import Component from '@reactions/component'
import { Counter, Info } from './UI'
import style from './style.scss'
import { Form } from './Form'
import './Assets/overlay.png'

import { EthereumProvider } from './Utils/EthereumProvider'
import CrowdsaleABI from './ABIs/Crowdsale-ABI.json'
import Karbon14TokenABI from './ABIs/Karbon14Token-ABI.json'

const updateUI = async ({ deployedContracts, accounts, setState, web3 }) => {
  const { Karbon14Token, Karbon14Crowdsale } = deployedContracts

  // Get Crowdsale Data

  await Karbon14Crowdsale.getTokenTotalSupply((err, res) => {
    res && setState({ totalSupply: web3.fromWei(res.toNumber(), 'ether') })
  })

  await Karbon14Crowdsale.closingTime((err, res) => {
    res && setState({ closingTime: res.toNumber() })
  })

  await Karbon14Crowdsale.rate((err, res) => {
    res && setState({ rate: res.toNumber() })
  })

  await Karbon14Crowdsale.goal((err, res) => {
    res && setState({ goal: web3.fromWei(res.toNumber(), 'ether') })
  })

  await Karbon14Crowdsale.cap((err, res) => {
    res && setState({ cap: web3.fromWei(res.toNumber(), 'ether') })
  })

  await Karbon14Crowdsale.weiRaised((err, res) => {
    res && setState({ weiRaised: web3.fromWei(res.toNumber(), 'ether') })
  })

  await Karbon14Crowdsale.getMaxCommunityTokens((err, res) => {
    res &&
      setState({
        getMaxCommunityTokens: web3.fromWei(res.toNumber(), 'ether')
      })
  })

  // Get Token Data

  await Karbon14Token.name((err, res) => {
    res && setState({ name: res })
  })

  await Karbon14Token.symbol((err, res) => {
    res && setState({ ticker: res })
  })

  await Karbon14Token.balanceOf(accounts.addresses[0], (err, res) => {
    res && setState({ balanceOf: web3.fromWei(res.toNumber(), 'ether') })
  })
}

const Crowdsale = ({ selectedLanguage, getTranslation }) => (
  <EthereumProvider
    contracts={[
      {
        name: 'Karbon14Crowdsale',
        ABI: CrowdsaleABI,
        address: process.env.CROWDSALE_ADDRESS
      },
      {
        name: 'Karbon14Token',
        ABI: Karbon14TokenABI,
        address: process.env.TOKEN_ADDRESS
      }
    ]}
  >
    {({ accounts = {}, deployedContracts = {}, web3 }) => {
      const { Karbon14Crowdsale = {}, Karbon14Token = {} } = deployedContracts

      const amountToLocale = n => {
        const locales = {
          EN: 'en-ES',
          ES: 'de-DE'
        }
        return Number(n).toLocaleString(locales[selectedLanguage], {
          minimumFractionDigits: 0
        })
      }

      return (
        <Component
          initialState={{
            totalSupply: undefined,
            closingTime: undefined,
            goal: undefined,
            cap: undefined,
            weiRaised: undefined,
            getMaxCommunityTokens: undefined,
            rate: undefined,
            name: undefined,
            ticker: undefined,
            balanceOf: undefined
          }}
          deployedContracts={deployedContracts}
          didUpdate={({ props, prevProps, setState }) => {
            if (!isEqual(props.deployedContracts, prevProps.deployedContracts))
              updateUI({ deployedContracts, accounts, setState, web3 })
          }}
          render={({ state }) => (
            <div className="intro">
              <div className="container">
                <div className="card-content">
                  <div className="left-container">
                    <div className="token">
                      <Counter
                        to={state.closingTime}
                        cap={state.cap}
                        goal={state.goal}
                        raised={state.weiRaised}
                        total={state.totalSupply / state.rate}
                        getTranslation={getTranslation}
                      />

                      <div className="contracts">
                        <div className="contract-info">
                          <Info
                            value={accounts ? accounts.addresses[0] : ''}
                            label={getTranslation('intro.currentAccount')}
                            copiedValueMsg={getTranslation(
                              'intro.copiedAddress'
                            )}
                            isLink={true}
                          />
                          <Info
                            value={Karbon14Token.address}
                            label={getTranslation('intro.tokenAddress')}
                            copiedValueMsg={getTranslation(
                              'intro.copiedAddress'
                            )}
                            isLink={true}
                          />
                          <Info
                            value={Karbon14Crowdsale.address}
                            label={getTranslation('intro.crowdsaleAddress')}
                            copiedValueMsg={getTranslation(
                              'intro.copiedAddress'
                            )}
                            isLink={true}
                          />

                          <div className="double">
                            <Info
                              value={state.name}
                              label={getTranslation('intro.name')}
                              className="double"
                            />
                            <Info
                              value={state.ticker}
                              label={getTranslation('intro.ticker')}
                              className="double"
                            />
                          </div>

                          <Info
                            value={
                              state.totalSupply && state.ticker
                                ? `${amountToLocale(state.totalSupply)} ${
                                    state.ticker
                                  }`
                                : ''
                            }
                            label={getTranslation('intro.supply')}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="info">
                      <h3>{getTranslation('intro.title')}</h3>
                      <p>{getTranslation('intro.subtitle')}</p>
                    </div>
                  </div>

                  <div className="right-container">
                    <Form
                      balance={
                        state.balanceOf
                          ? amountToLocale(state.balanceOf)
                          : state.balanceOf
                      }
                      rate={state.rate}
                      ticker={state.ticker}
                      getTranslation={getTranslation}
                      buyTokens={Karbon14Crowdsale.buyTokens}
                      web3={web3}
                      accounts={accounts}
                      amountToLocale={amountToLocale}
                    />
                  </div>
                </div>
              </div>
              <style jsx>{style}</style>
            </div>
          )}
        />
      )
    }}
  </EthereumProvider>
)

Crowdsale.propTypes = {
  selectedLanguage: PropTypes.string,
  deployedContracts: PropTypes.object,
  getTranslation: PropTypes.func
}

export { Crowdsale }