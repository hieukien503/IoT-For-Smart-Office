import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

export default function BasicTable({ rows }) {
  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table
          stickyHeader
          sx={{ minWidth: 300, width: 1100 }}
          aria-label="simple table"
        >
          <TableHead>
            <TableRow>
              <TableCell style={{ fontWeight: "bold", fontSize: "16px" }}>
                ID
              </TableCell>
              <TableCell style={{ fontWeight: "bold", fontSize: "16px" }}>
                Value
              </TableCell>
              <TableCell
                align="right"
                style={{ fontWeight: "bold", fontSize: "16px" }}
              >
                Created At
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows &&
              [...rows].reverse().map((row) => (
                <TableRow key={row._id}>
                  <TableCell component="th" scope="row">
                    {row._id}
                  </TableCell>
                  <TableCell>{row.value}</TableCell>
                  <TableCell align="right">{row.created_at}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
