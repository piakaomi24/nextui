"use client";

import React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { title } from "@/components/primitives";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Input,
  Button,
  Progress,
  Chip,
  getKeyValue,
} from "@nextui-org/react";
import { users } from "./data";
import {
  WagmiProvider,
  useWaitForTransactionReceipt,
  useWriteContract,
  useReadContract,
} from "wagmi";
import { erc20Abi } from "viem";
import VaultABI from "../abis/VaultABI.json";

export default function BorrowPage() {

  const [usde, setUsde] = useState<number>(0);
  const [idre, setIdre] = useState<number>(0);
  const [percentage, setPercentage] = useState(0);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(true);

  const IDRE_PER_USDE = 15000; // 1 USDE = 15000 IDRE
  const oneEthInWei = BigInt(10 ** 18);

  const { data: balance } = useReadContract({
    abi: erc20Abi,
    address: "0x04392363e80364d10bddb2318297277d50f50c43",
    functionName: "balanceOf",
    args: ["0x14df0Ac1D9FaFdEb52b23a2A5Eaf45bDd3C39248"],
  });

  const {
    data: approvalHash,
    isPending: isApprovalPending,
    writeContract: writeApproval,
  } = useWriteContract();

  const handleApproval = async () => {
    await writeApproval({
      abi: erc20Abi,
      address: '0x04392363e80364d10bddb2318297277d50f50c43',
      functionName: 'approve',
      args: ['0x14df0Ac1D9FaFdEb52b23a2A5Eaf45bDd3C39248', BigInt(BigInt(usde) * oneEthInWei)],
    });
  };

  const { isLoading: isApprovalLoading, status: statusApproval } =
    useWaitForTransactionReceipt({
      hash: approvalHash,
    });

  const {
    data: mintHash,
    isPending: isMintPending,
    writeContract: writeMint,
  } = useWriteContract();

  const handleMint = async () => {
    await writeMint({
      abi: VaultABI,
      address: '0x14df0Ac1D9FaFdEb52b23a2A5Eaf45bDd3C39248',
      functionName: 'mint',
      args: [BigInt(BigInt(usde) * oneEthInWei), BigInt(100)],
    });
  };

  const { isLoading: isMintLoading, status: statusMint } =
    useWaitForTransactionReceipt({
      hash: mintHash,
    });

  const handleCalculation = (usdeValue: number, idreValue: number) => {
    const usdeToIdre = usdeValue * IDRE_PER_USDE;
    const total = usdeToIdre;

    if (total === 0) {
      setPercentage(0); // Default 50% jika input kosong
      setIsSubmitDisabled(true);
      return;
    }

    const idrePercentage = (idreValue / total) * 100;
    setPercentage(idrePercentage);

    // Atur tombol submit berdasarkan kondisi
    if (usdeValue > 0 && idreValue > 0 && idrePercentage <= 80) {
      setIsSubmitDisabled(false);
    } else {
      setIsSubmitDisabled(true);
    }
  };

  const handleSubmit = () => {
    alert("Data berhasil dikirim!");
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <div>
            <Card className="w-100 h-100 p-3">
              <CardHeader className="flex gap-3">
                <div className="flex flex-col text-start">
                  <p className="text-md">Deposit</p>
                </div>
              </CardHeader>
              <CardBody>
                <Input
                  type="number"
                  label="Insert amount to deposit"
                  placeholder="0"
                  min={0}
                  labelPlacement="inside"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">USDe</span>
                    </div>
                  }
                  onChange={(e) => {
                    const value = e.target.value
                      ? parseFloat(e.target.value)
                      : 0;
                    setUsde(value);
                    handleCalculation(value, idre);
                  }}
                />
              </CardBody>
            </Card>
          </div>
          <div>
            <Card className="w-100 p-3">
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
                  min={0}
                  labelPlacement="inside"
                  onChange={(e) => {
                    const value = e.target.value
                      ? parseFloat(e.target.value)
                      : 0;
                    setIdre(value);
                    handleCalculation(usde, value);
                  }}
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
            <Card className="w-100 p-3">
              <CardHeader className="flex gap-3">
                <div className="flex flex-col text-start w-full">
                  <p className="text-md">Loan to Value (LTV)</p>
                  <p className="text-sm opacity-50">
                    Ratio of the collateral value to the borrowed value
                  </p>
                </div>
                <div className="flex flex-col text-end w-full">
                  <p className="text-md">{percentage.toFixed(2)}%</p>
                  <p className="text-sm opacity-50">max. 80.00%</p>
                </div>
              </CardHeader>
              <CardBody>
                <Progress
                  aria-label="Loading..."
                  value={percentage}
                  maxValue={100}
                  onChange={() => { }}
                  showValueLabel={false}
                  className="max-w" />
                {percentage > 80 && (
                  <Chip className="mt-4" color="danger">Not enough collateral to borrow this amount</Chip>
                )}
              </CardBody>
            </Card>
            <Button
              onPress={handleSubmit}
              isDisabled={isSubmitDisabled}
              className="mt-5"
              fullWidth
              size="md"
              color="primary"
              variant="shadow">
              Borrow
            </Button>
          </div>
          <div className="col-span-2 mt-2">
            <Card className="w-100 p-3">
              <CardHeader className="flex gap-3">
                <div className="flex flex-col text-start w-full">
                  <p className="text-md">Action</p>
                </div>
              </CardHeader>
              <CardBody>
                <div className="bg-content2 p-3 rounded-lg flex flex-col gap-3">
                  <div className="flex gap-4 items-center">
                    <div className="p-2 bg-content1 rounded-md px-4 font-bold text-sm">1</div>
                    <p className="mb-0 text-sm min-w-32">Approve USDe</p>
                    <p className="mb-0 text-sm font-bold">{usde} <span className="opacity-50">USDe</span></p>
                    <Button
                      className="ms-auto min-w-24"
                      size="sm"
                      color="primary"
                      variant="shadow"
                      onClick={() => handleApproval()}>
                      Approve
                    </Button>
                  </div>
                  <Divider className="opacity-50" />
                  <div className="flex gap-4 items-center">
                    <div className="p-2 bg-content1 rounded-md px-4 font-bold text-sm">2</div>
                    <p className="mb-0 text-sm min-w-32">Deposit USDe</p>
                    <p className="mb-0 text-sm font-bold">{usde} <span className="opacity-50">USDe</span></p>
                    <Button
                      className="ms-auto min-w-24"
                      size="sm"
                      color="primary"
                      variant="shadow">
                      Deposit
                    </Button>
                  </div>
                  <Divider className="opacity-50" />
                  <div className="flex gap-4 items-center">
                    <div className="p-2 bg-content1 rounded-md px-4 font-bold text-sm">3</div>
                    <p className="mb-0 text-sm min-w-32">Borrow IDRe</p>
                    <p className="mb-0 text-sm font-bold">{idre} <span className="opacity-50">IDRe</span></p>
                    <Button
                      className="ms-auto min-w-24"
                      size="sm"
                      color="primary"
                      variant="shadow">
                      Borrow
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
