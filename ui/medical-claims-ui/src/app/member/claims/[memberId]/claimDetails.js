"use client";

import React, { useState, useEffect } from 'react'
import { Table, Spinner, Pagination } from 'flowbite-react';
import Link from 'next/link'
import Moment from 'moment'
import TransactionsStatement from '../../../hooks/TransactionsStatement'
import { AcknowledgeButton, DenyClaimButton, ProposeClaimButton, ApproveClaimButton } from './ClaimActions'

let money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function ClaimDetails({ claimId, requestClaims }){
	const { data, isLoading, mutate } = TransactionsStatement.getClaimDetails(claimId);

	return((!isLoading && data) ? (
		<>
			<div className="card">
				<div className="card-header grid grid-cols-2">
					<h4 className="card-title">Claim Details</h4>
					<div className='text-right'><label>Filing Date: </label>{ Moment(data.filingDate).format('MMMM DD, YYYY') }</div>
				</div>
				<div className="card-body">
					<div className="relative overflow-x-auto sm:rounded">
						<div className='grid grid-cols-2 w-9/12'>
							<div className='px-4 font-bold gap-2'>Claim Id:</div>
							<div className='float-left'>{data.claimId}</div>
							<div className='px-4 font-bold gap-2'>Claim Status:</div>
							<div>
								{data.claimStatus} 
								<ClaimsActions claimStatus={data.claimStatus} claimId={data.claimId} {...{data, requestClaims, mutate}}/>
							</div>
							<div className='px-4 font-bold gap-2'>Payer Name:</div>
							<div>{data.payerName ? data.payerName : '-'}</div>
							<div className='px-4 font-bold gap-2'>Total Amount:</div>
							<div>{money.format(data.totalAmount)}</div>
							<div className='px-4 font-bold gap-2'>Provider Name:</div>
							<div>{data.providerName}</div>
							<div className='px-4 font-bold gap-2'>Comment:</div>
							<div>{data.comment}</div>
						</div>
						<div>
							<h4 className="card-title mt-10 mb-10">Line Items</h4>
							<LineItemsTable data={data.lineItems ? data.lineItems : []}/>
						</div>
					</div>
				</div>
			</div>
		</>
	) : <Spinner aria-label="Loading..." />);
}

function ClaimsActions({claimStatus, claimId, requestClaims }){
	switch(claimStatus){
		case "Assigned":
			return (<AcknowledgeButton claimId={claimId} {...{requestClaims}} />);
			break;
		case "Acknowledged":
			return (
				<>
					<DenyClaimButton claimId={claimId} {...{requestClaims}}/>
					<ProposeClaimButton claimId={claimId} {...{requestClaims}}/>
				</>
			);
			break;
		case "ApprovalRequired":
			return (
				<>
					<DenyClaimButton claimId={claimId} {...{requestClaims}}/>
					<ApproveClaimButton claimId={claimId} {...{requestClaims}}/>
				</>
			);
			break;
		default:
			return(null);
			break;
	}
}

function LineItemsTable({ data }){
	const headers = [
		{ key: 'procedureCode', name: 'Procedure Code'},
		{ key: 'description', name: 'Description'},
		{ key: 'serviceDate', name: 'Service Date'},
		{ key: 'amount', name: 'Amount'},
		{ key: 'discount', name: 'Discount'},
	];

	return(
		<>
			<LineItemsDataTable {...{data, headers}}/>
		</>
	);
}

function LineItemsDataTable({headers, data}){
	return(
	    <Table className="w-full" hoverable>
	      <Table.Head>
	        {headers.map((header) => (
	          <Table.HeadCell key={header.key} className="!p-4">
	            {header.name}
	          </Table.HeadCell>
	        ))}
	        <Table.HeadCell className="!p-4"/>
	      </Table.Head>
	      <Table.Body className="divide-y">
	        {data.map((row) => (
	          <Table.Row key={row.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
	            {Object.values(headers).map((header, index) => (
	              <Table.Cell key={`${row.id}-${index}`} className="!p-4">
	                { formatValues(header.key, row[header.key])}
	              </Table.Cell>
	            ))}
	            <Table.Cell className="!p-4">
	            	<Link href='#' onClick={()=> setClaimId(row.claimId)}>Apply Discount</Link>
	            </Table.Cell>
	          </Table.Row>
	        ))}
	      </Table.Body>
	    </Table>
	);
}

function formatValues(headerKey, value){
	switch(headerKey){
		case "serviceDate":
			return Moment(value).format('YYYY-MM-DD');
			break;
		case "amount":
		case "discount":
			return money.format(value);
			break;
		default:
			return value ? value : '-';
	}	
}