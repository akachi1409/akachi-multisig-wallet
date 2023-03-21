import Web3 from "web3";
import getRpcUrl from 'utils/getRpcUrl'

import MultiSigAbi from 'assets/abi/MultiSig.json';
import {
    MultiSigAddress,
} from 'mainConfig'

const RPC_URL = getRpcUrl()

export const useWeb3Content = () => {
    const web3 = new Web3(window.ethereum || RPC_URL);
    return web3;
}

export const useContract = (abi, address) => {
    const web3 = useWeb3Content();
    return new web3.eth.Contract(abi, address);
}

export const useWalletContract = ()=> {
    return useContract(MultiSigAbi, MultiSigAddress);
}