# Voting Decentralized Application

## Environment Setup

### 1. Dependencies
1.1 Install [Nodejs](https://nodejs.org/es/) and npm
<br>
1.2 `$ npm install -g truffle` 
( [truffle package](https://github.com/trufflesuite/truffle)  )
<br> 
1.3 `$ npm install -g ganache-cli` 
( [ganache-cli package](https://github.com/trufflesuite/ganache-cli) )
<br> 

### 2. Ganache desktop application
[Install Ganache](https://www.trufflesuite.com/ganache)
<br> 
### 3. MetaMask chrome extension
[Install MetaMask](https://metamask.io/)
<br> 

## Run Application
Build blockchain network
```shell
$ ganache-cli
```
_Keep the session running_


Deploy the smart contract
```shell
$ truffle migrate --reset
```

Start dev server
```shell
$ npm run dev
```


## Ganache Configuration
Config host address
![](config/images/Config-Ganache-desktop.png)

## MetaMask Configuration

Config network

![](config/images/Config-MetaMask1.png)

Import account using the private key provided when the blockchain network is built

![](config/images/Config-MetaMask2.png)




## [Reference](https://www.dappuniversity.com/articles/the-ultimate-ethereum-dapp-tutorial)
