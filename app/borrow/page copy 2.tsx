"use client";

import React from "react";
import { title } from "@/components/primitives";
import { Card, CardHeader, CardBody, CardFooter, Divider, Input, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, getKeyValue, } from "@nextui-org/react";
import { users } from "./data";
import { WagmiProvider, useWaitForTransactionReceipt, useWriteContract, useReadContract } from 'wagmi';
import { erc20Abi } from "viem";
import VaultABI from '../abis/VaultABI.json';

export default function DocsPage() {

  const { data: balance } = useReadContract({
    abi: erc20Abi,
    address: '0x04392363e80364d10bddb2318297277d50f50c43',
    functionName: 'balanceOf',
    args: ['0x14df0Ac1D9FaFdEb52b23a2A5Eaf45bDd3C39248'],
  });

  const {
    data: approvalHash,
    isPending: isApprovalPending,
    writeContract: writeApproval
  } = useWriteContract();

  const handleApproval = async () => {
    await writeApproval({
      abi: erc20Abi,
      address: '0x04392363e80364d10bddb2318297277d50f50c43',
      functionName: 'approve',
      args: ['0x14df0Ac1D9FaFdEb52b23a2A5Eaf45bDd3C39248', BigInt(1000)],
    });
  };

  const {
    isLoading: isApprovalLoading, status: statusApproval
  } = useWaitForTransactionReceipt({
    hash: approvalHash,
  });

  const {
    data: mintHash,
    isPending: isMintPending,
    writeContract: writeMint
  } = useWriteContract();

  const handleMint = async () => {
    await writeMint({
      abi: VaultABI,
      address: '0x14df0Ac1D9FaFdEb52b23a2A5Eaf45bDd3C39248',
      functionName: 'mint',
      args: [BigInt(1000), BigInt(100)],
    });
  };

  const {
    isLoading: isMintLoading, status: statusMint
  } = useWaitForTransactionReceipt({
    hash: mintHash,
  });

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <div>
            <Card className="w-100">
              <CardHeader className="flex gap-3">
                <div className="flex flex-col text-start">
                  <p className="text-md">Deposit</p>
                </div>
              </CardHeader>              
              <CardBody>
                <Input
                  type="number"
                  label="Insert amount to deposit"
                  placeholder="0.0"
                  labelPlacement="inside"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">USDe</span>
                    </div>
                  }
                />
              </CardBody>
            </Card>
          </div>
          <div>
            <Card className="w-100">
              <CardHeader className="flex gap-3">
                <div className="flex flex-col text-start">
                  <p className="text-md">Borrow</p>
                </div>
              </CardHeader>              
              <CardBody>
                <Input
                  type="number"
                  label="Insert amount you want to borrow"
                  placeholder="0"
                  labelPlacement="inside"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">IDR</span>
                    </div>
                  }
                />
              </CardBody>
            </Card>
          </div>
          <div className="col-span-2">
            <Card className="w-100">
              <CardHeader className="flex gap-3">
                <div className="flex flex-col text-start w-full">
                  <p className="text-md">Loan to Value (LTV)</p>
                  <p className="text-sm opacity-50">Ratio of the collateral value to the borrowed value</p>
                </div>
                <div className="flex flex-col text-end w-full">
                  <p className="text-md">0.00%</p>
                  <p className="text-sm opacity-50">max. 79.00%</p>
                </div>
              </CardHeader>              
              <CardBody>                
              </CardBody>              
            </Card>
            <Button className="mt-3" fullWidth size="md" color="primary" variant="shadow">
              Borrow
            </Button>
          </div>
        </div>
        <div className="text-start">
          <div>Balance: {balance?.toString()}</div>
          <Button onClick={() => handleApproval()} className="mt-4" fullWidth size="md" color="primary" variant="shadow">
            Approve
          </Button>
          <div className="mt-4">Pending: {isApprovalPending ? 'Sedang approve' : 'tidak sedang approve'}</div>
          <div>Approval Hash: {approvalHash}</div>
          {isApprovalLoading ? <div>Status: {statusApproval}</div> : null}
          <div>Status: {statusApproval}</div>
          <Button onClick={() => handleMint()} className="mt-4" fullWidth size="md" color="primary" variant="shadow">
            Mint
          </Button>
          <div className="mt-4">Pending: {isMintPending ? 'Sedang mint' : 'tidak sedang mint'}</div>
          <div>Mint Hash: {mintHash}</div>
          {isMintLoading ? <div>Status: {statusMint}</div> : null}
          <div>Status: {statusMint}</div>
        </div>
      </div>
    </div>
  );
}
