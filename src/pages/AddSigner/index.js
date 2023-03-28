import React, { useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, MenuItem, Grid } from '@mui/material';
import LoadingButton from "@mui/lab/LoadingButton";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useWalletContract, useWeb3Content } from "hooks/useContractHelpers"
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import useHouseMintStyle from "assets/styles/houseMintStyle";
import { houseInfo, houseError, houseSuccess } from "hooks/useToast";
import { GoldContractAddress } from 'mainConfig'

export default function AddSigner() {
    const navigate = useNavigate()
    const [searchAddress, setSearchAddress] = useState('')
    // const [contractAddress, setContractAddress] = useState('');
    const [removeAddress, setRemoveAddress] = useState('');
    const [creationAmount, setCreationAmount] = useState(0);
    const [redemptionAmount, setRedemptionAmount] = useState(0);
    const [creationAddress, setCreationAddress] = useState('');
    const [redemptionAddress, setRedemptionAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [signerList, setSignerList] = useState([])
    const [signerCount, setSignerCount] = useState(0);
    const { account } = useWeb3React()
    const classes = useHouseMintStyle();
    const walletContract = useWalletContract();
    const web3 = useWeb3Content();

    const handleSearchAddress = async () => {
        const isSigner = await walletContract.methods._signers(searchAddress).call();
        if (isSigner) {
            houseSuccess("That address is already signer.")
            return;
        }
        // const balance = await walletContract.methods.getBalanceWho(searchAddress).call();
        // console.log("balance", balance);
        // if (balance <=0){
        //     houseError("Target address should deposit some avax in the contract.")
        //     return;
        // }
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

    const handleRemoveAddress = () => {
        setLoading(true);
        walletContract.methods.removeSigner(removeAddress).send({
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
            const tempSignerCount = await walletContract.methods._signersCount().call();
            setSignerCount(tempSignerCount);
            const tempSigerList = []
            for (var i = 0 ; i< tempSignerCount; i++){
                const s = await walletContract.methods._signerList(i).call();
                const item = {
                    address: s,
                    id: i
                }
                tempSigerList.push(item);
            }
            setSignerList(tempSigerList);
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

    const handleCerationBasket = () => {
        walletContract.methods.createCreationBasketRequest(GoldContractAddress, web3.utils.toWei(creationAmount, 'ether'), creationAddress, 'token').send({
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

    const handleRedemptionBasket = () =>{
        walletContract.methods.createRedemptionBasketRequest(GoldContractAddress, web3.utils.toWei(redemptionAmount, 'ether'), redemptionAddress).send({
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
    
    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
          backgroundColor: theme.palette.common.black,
          color: theme.palette.common.white,
        },
        [`&.${tableCellClasses.body}`]: {
          fontSize: 14,
        },
      }));
      
    const StyledTableRow = styled(TableRow)(({ theme }) => ({
        '&:nth-of-type(odd)': {
          backgroundColor: theme.palette.action.hover,
        },
        // hide last border
        '&:last-child td, &:last-child th': {
          border: 0,
        },
    }));

    return(
        <Grid>
            <Box component={'h2'}>Current Signers</Box>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 700 }} aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>ID</StyledTableCell>
                            <StyledTableCell align="center">Address</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            signerList.map((row) =>(
                                <StyledTableRow key={row.id}>
                                    <StyledTableCell component="th" scope="row">
                                        {row.id}
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        {row.address}
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
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
            <Box component={'h2'}>Remove Signer</Box>
            <Grid container spacing={3}>
                <Grid item xs={9}>
                <TextField
                    className={classes.needField}
                    variant="filled"
                    label="Wallet Address"
                    placeholder={account}
                    value={removeAddress}
                    multiline
                    onChange={(e) => {
                        setRemoveAddress(e.target.value);
                    }}
                />
                </Grid>
                <Grid item xs={3}>
                <LoadingButton
                    onClick={handleRemoveAddress}
                    endIcon={<AddCircleIcon />}
                    loading={loading}
                    loadingPosition="end"
                    variant="contained"
                >
                        Request Remove Signer
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
            <Box component={'h2'}>Creation Basket</Box>
            <Grid container spacing={3}>
                {/* <Grid item xs={3}>
                <TextField
                    className={classes.needField}
                    variant="filled"
                    label="Contract Address"
                    placeholder={account}
                    value={contractAddress}
                    multiline
                    onChange={(e) => {
                        setContractAddress(e.target.value);
                    }}
                />
                </Grid> */}
                <Grid item xs={4}>
                <TextField
                    className={classes.needField}
                    variant="filled"
                    label="Creation Amount"
                    placeholder='100'
                    value={creationAmount}
                    multiline
                    onChange={(e) => {
                        setCreationAmount(e.target.value);
                    }}
                />
                </Grid>
                <Grid item xs={4}>
                <TextField
                    className={classes.needField}
                    variant="filled"
                    label="Wallet Address"
                    placeholder={account}
                    value={creationAddress}
                    multiline
                    onChange={(e) => {
                        setCreationAddress(e.target.value);
                    }}
                />
                </Grid>
                <Grid item xs={4}>
                <LoadingButton
                    onClick={handleCerationBasket}
                    endIcon={<AddCircleIcon />}
                    loading={loading}
                    loadingPosition="end"
                    variant="contained"
                >
                        Request Creaion Basket
                </LoadingButton>
                </Grid>
            </Grid>
            <Box component={'h2'}>Redemption Basket</Box>
            <Grid container spacing={3}>
                <Grid item xs={4}>
                <TextField
                    className={classes.needField}
                    variant="filled"
                    label="Creation Amount"
                    placeholder='100'
                    value={redemptionAmount}
                    multiline
                    onChange={(e) => {
                        setRedemptionAmount(e.target.value);
                    }}
                />
                </Grid>
                <Grid item xs={4}>
                <TextField
                    className={classes.needField}
                    variant="filled"
                    label="Wallet Address"
                    placeholder={account}
                    value={redemptionAddress}
                    multiline
                    onChange={(e) => {
                        setRedemptionAddress(e.target.value);
                    }}
                />
                </Grid>
                <Grid item xs={4}>
                <LoadingButton
                    onClick={handleRedemptionBasket}
                    endIcon={<AddCircleIcon />}
                    loading={loading}
                    loadingPosition="end"
                    variant="contained"
                >
                        Request Redepmtion Basket
                </LoadingButton>
                </Grid>
            </Grid>
        </Grid>
    )
}