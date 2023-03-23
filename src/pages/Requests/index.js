import React, { useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core';
import { Box, TextField, MenuItem, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import LoadingButton from "@mui/lab/LoadingButton";
import { useNavigate } from 'react-router-dom';

import { houseInfo, houseError, houseSuccess } from "hooks/useToast";
import useNftStyle from 'assets/styles/nftStyle';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useWalletContract, useWeb3Content } from "hooks/useContractHelpers"

export default function Requests() {
  const navigate = useNavigate()
  const { account } = useWeb3React()
  const [loading, setLoading] = useState(false);
  const [allRequests, setAllRequests] = useState([])
  const [isSigner, setIsSigner] = useState(false);
  
  const walletContract = useWalletContract();
  const web3 = useWeb3Content();

  useEffect(async ()=> {
    if (account){
      const temp = await walletContract.methods._signers(account).call();
      console.log("temp", temp);
      setIsSigner(temp)
      setRequets();
    }
  },[account])

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

  const RequestType =[
    "ADD_SIGNER",
    "REMOVE_SIGNER",
    "INCREASE_REQ_SIGNATURES",
    "DECREASE_REQ_SIGNATURES",
    "SEND_TRANSACTION",
    "SEND_TOKEN",
    "FREEZE_TRANSACTION",
    "CREATION_BASKET",
    "REDEMPTION_BASKET"
  ]

  const approveSign = async(index) => {
    if (!isSigner) {
        houseError("Caller is not the signer.")
        return;
    }
    setLoading(true);
    walletContract.methods.sign(allRequests[index].idx).send({
      from: account
    }).then((data)=>{
      setLoading(false);
      console.log("data", data)
      if (data.status) setRequets();
    }).catch(err=> {
      setLoading(false);
      console.log("err", err)
      houseError(err)
    })
  }

  const runExecute = async (index) => {
    if (allRequests[index].currentSignatures < allRequests[index].requiredSignatures){
      houseError("Not enough signature.")
      return;
    }
    setLoading(true);
    walletContract.methods.execute(allRequests[index].idx).send({
      from: account
    }).then((data)=>{
      console.log("data", data)
      setLoading(false)
      if (data.status) setRequets();
    }).catch(err=> {
      setLoading(false);
      console.log("err", err)
      houseError(err)
    })
  }

  const setRequets = async() =>{
    const temp = [];
    const requestLength = await walletContract.methods.
      getRequestLength().call()
    console.log("length", requestLength)
    for ( var i = 0 ; i< requestLength ; i++ ){
      var request = await walletContract.methods._requests(i).call();
      var approved = await walletContract.methods.checkSign(request.idx, account).call();
      request.approved = approved;
      request.index = i;
      console.log("request", request);
      temp.push(request);
    }
    setAllRequests(temp);
  }

  return (
    <Grid>
      <Box component={'h2'}>Requests</Box>
      <TableContainer component={Paper}>
      <Table sx={{ minWidth: 700 }} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>ID</StyledTableCell>
            <StyledTableCell align="right">Required Signature</StyledTableCell>
            <StyledTableCell align="right">Current Signature</StyledTableCell>
            <StyledTableCell align="right">Required Type</StyledTableCell>
            <StyledTableCell align="right">Status</StyledTableCell>
            <StyledTableCell align="right">Data</StyledTableCell>
            <StyledTableCell align="right">Action</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {allRequests.map((row) => (
            <StyledTableRow key={row.idx}>
              <StyledTableCell component="th" scope="row">
                {row.idx}
              </StyledTableCell>
              <StyledTableCell align="right">{row.requiredSignatures}</StyledTableCell>
              <StyledTableCell align="right">{row.currentSignatures}</StyledTableCell>
              <StyledTableCell align="right">{RequestType[row.requestType]}</StyledTableCell>
              <StyledTableCell align="right">{row.isExecuted ? "Executed": "Not executed yet"}</StyledTableCell>
              <StyledTableCell align="right">{row.data ? web3.eth.abi.decodeParameter('address', row.data): ""}</StyledTableCell>
              { isSigner && !row.approved && !row.isExecuted &&
              (<StyledTableCell align="right">
                <LoadingButton endIcon={<CheckBoxIcon />} variant="outlined" onClick={()=> approveSign(row.index)} loading={loading} loadingPosition="end">Approve</LoadingButton>
              </StyledTableCell>)}
              {/* { !isSigner && !row.approved && 
              (<StyledTableCell align="right"></StyledTableCell>)} */}
              { (!isSigner || row.approved) && !row.isExecuted && 
              (<StyledTableCell align="right">
                <LoadingButton endIcon={<CheckCircleIcon/>} variant="contained" loading={loading} loadingPosition="end" onClick = {()=> runExecute(row.index)}>Execute</LoadingButton></StyledTableCell>)}
              { row.isExecuted && (<StyledTableCell align="right">Already Executed</StyledTableCell>)}
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </Grid>
  )
}
