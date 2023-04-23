import React, { useState, FC } from 'react';
import {useTable, Column} from "react-table"
import { TDWrapper, THWrapper, THeadWrapper, TableWrapper } from './Table.styled';
import Yahtzee from '../../Services/API';

interface TableProps {
    columns: Column[]
    data: Row[]
    selected: boolean[]
    yahtzee: Yahtzee
    addy: string
}

interface Row {
    category: string
    player1: number | null
    player2: number | null
}

const Table: FC<TableProps> = (props: TableProps) => {

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({columns: props.columns, data: props.data})

  return (
    <TableWrapper {...getTableProps()}>
      <THeadWrapper>
        {
          headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {
                  headerGroup.headers.map( column => (
                    <THWrapper {...column.getHeaderProps()}>
                      {
                        column.render('Header')
                      }
                    </THWrapper>
                  ))
                }
              </tr>
          ))
        }
      </THeadWrapper>
      <tbody {...getTableBodyProps()}>
        { // loop over the rows
          rows.map((row, rowind) => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()}>
                { // loop over the rows cells 
                  row.cells.map((cell, cellind) => (
                    <TDWrapper style={usedCat(rowind, cellind) ? {color : 'red'} : {color: 'green'}} onClick={() => onclick(rowind, cellind)} {...cell.getCellProps()}>
                      {cell.render('Cell')}
                    </TDWrapper>
                  ))
                }
              </tr> 
            )
          })
        }
        <tr>
          <td></td>
        </tr>
      </tbody>
    </TableWrapper>
  );

  function usedCat(category: number, player: number): boolean {
    if (player == 1) {
      return props.yahtzee.state.player1_scores[category] >= 0;
    } else if (player == 2) {
      return props.yahtzee.state.player2_scores[category] >= 0;
    } else {
      return false;
    }
  }

  async function onclick(rowind: number, cellind: number) {
    if (cellind > 0) {
      let promise = await props.yahtzee.bankRoll(rowind, props.addy)
      console.log("banking roll with dice: ")
      console.log(rowind)
    }
  }
}

export default Table;