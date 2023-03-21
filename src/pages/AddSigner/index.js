import React, { useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, MenuItem, Grid } from '@mui/material';
import LoadingButton from "@mui/lab/LoadingButton";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useWalletContract } from "hooks/useContractHelpers"
import useNftStyle from 'assets/styles/nftStyle';
import useHouseMintStyle from "assets/styles/houseMintStyle";
import { houseInfo, houseError, houseSuccess } from "hooks/useToast";

export default function AddSigner() {
    const navigate = useNavigate()
    const [searchAddress, setSearchAddress] = useState('')
    const [loading, setLoading] = useState(false);
    const { account } = useWeb3React()
    const classes = useHouseMintStyle();
    const walletContract = useWalletContract();
    

    const handleSearchAddress = async () => {
        const isSigner = await walletContract.methods._signers(searchAddress).call();
        if (isSigner) {
            houseSuccess("That address is already signer.")
            return;
        }
        const balance = await walletContract.methods.getBalanceWho(searchAddress).call();
        console.log("balance", balance);
        if (balance <=0){
            houseError("Target address should deposit some avax in the contract.")
            return;
        }
        setLoading(true);
        walletContract.methods.addSigner(searchAddress).send({
            from: account
        }).then((data)=> {
            setLoading(false)
            console.log('result', data)
            if (data.status){
                navigate("/")
            }
        })
        .catch(err=> {
            setLoading(false);
            console.log("err", err)
            houseError(err)
        })
    }

    useEffect(async()=>{
        if (account){
            const isSigner = await walletContract.methods._signers(account).call();
            if (!isSigner) {
                navigate("/")
            }
        }
    }, [account])

    const increaseSignature = () => {
        walletContract.methods.increaseRequiredSignatures().send({
            from: account
        }).then((data)=> {
            setLoading(false)
            console.log('result', data)
            if (data.status){
                navigate("/")
            }
        })
        .catch(err=> {
            setLoading(false);
            console.log("err", err)
            houseError(err)
        })
    }
    return(
        <Grid>
            <Box component={'h2'}>Add Signer</Box>
            <Grid container spacing={3}>
                <Grid item xs={9}>
                <TextField
                    className={classes.needField}
                    variant="filled"
                    label="Wallet Address"
                    placeholder={account}
                    value={searchAddress}
                    multiline
                    onChange={(e) => {
                        setSearchAddress(e.target.value);
                    }}
                />
                </Grid>
                <Grid item xs={3}>
                <LoadingButton
                    onClick={handleSearchAddress}
                    endIcon={<AddCircleIcon />}
                    loading={loading}
                    loadingPosition="end"
                    variant="contained"
                >
                        Request Add Signer
                </LoadingButton>
                </Grid>
            </Grid>
            <br/>
            <Box component={'h2'}>Increase Signature</Box>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                <LoadingButton
                    onClick={increaseSignature}
                    endIcon={<AddCircleIcon />}
                    loading={loading}
                    loadingPosition="end"
                    variant="contained"
                >
                        Request Increase Signature
                </LoadingButton>
                </Grid>
            </Grid>
        </Grid>
    )
}