import React, { useState, useRef, useEffect } from "react";
import { Grid } from "@mui/material";
import useWebSocket from "react-use-websocket";
import axios from "axios";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Chart from "./Chart";
import BasicTable from "./Table";
import dayjs from "dayjs";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from '@mui/material/Typography';

function Dashboard() {
  const [device, setDevice] = useState("home.sh-humid");
  const [tableData, setTableData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [startDateTime, setStartDateTime] = useState(
    dayjs(new Date().getTime() - 60 * 60 * 1000)
  );
  const [endDateTime, setEndDateTime] = useState(
    dayjs(new Date().getTime() + 60 * 60 * 1000)
  );
  const [checked, setChecked] = useState(true);

  const { sendJsonMessage, getWebSocket } = useWebSocket(
    "ws://127.0.0.1:8000/io",
    {
      onOpen: () => console.log("WebSocket connection opened."),
      onClose: () => console.log("WebSocket connection closed."),
      shouldReconnect: (closeEvent) => true,
      onMessage: (event) => processMessages(event),
    }
  );

  const handleChange = (event) => {
    setDevice(event.target.value);
    sendJsonMessage({
      event: "device_changed",
      data: event.target.value,
    });
  };

  const processMessages = (event) => {
    let payload = JSON.parse(event.data);
    if (payload.event === "incoming_value") {
      let cpyChartData = JSON.parse(JSON.stringify(chartData));
      cpyChartData = [
        ...cpyChartData,
        [
          new Date(
            new Date(payload.data["created_at"]).getTime() + 7 * 60 * 60 * 1000
          ).getTime(),
          payload.data["value"],
        ],
      ];
      setChartData(cpyChartData);
      setTableData((prev) => {
        return [...prev, payload.data];
      });

      if (payload.device == "home.sh-led") {
        setChecked(!(payload.data["value"] === 0));
      }
    }
  };

  const handleLEDButton = () => {
    axios
      .get(
        `${process.env.REACT_APP_API}/led/publishMQTT/${!checked ? "1" : "0"}`
      )
      .then((res) => {
        if (device != "home.sh-led") {
          setChecked(res.data["status"]);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API}/records/${device}`)
      .then((res) => {
        let transform_data = res.data.map((record) => {
          return [
            new Date(
              new Date(record["created_at"]).getTime() + 7 * 60 * 60 * 1000
            ).getTime(),
            record["value"],
          ];
        });
        setChartData(transform_data);
        setTableData(res.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [device]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API}/led/status`)
      .then((res) => {
        setChecked(res.data[0]["value"]);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);

  return (
    <>
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent="center"
        sx={{ minHeight: "100vh" }}
      >
        <Grid item>
          <Typography variant="h3">
            Smart Office
          </Typography>
        </Grid>
        <Grid
          container
          direction="row"
          alignItems="center"
          justifyContent="center"
        >
          <Grid
            item
            xs={6.7}
            sx={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-end",
            }}
          >
            <FormControl sx={{ m: 1, minWidth: 160 }} variant="standard">
              <InputLabel id="device">Device</InputLabel>
              <Select
                labelId="device"
                id="_device"
                value={device}
                label="Device"
                onChange={handleChange}
              >
                <MenuItem value="home.sh-humid">Humid</MenuItem>
                <MenuItem value="home.sh-led">Led</MenuItem>
                <MenuItem value="home.sh-lumos">Lumos</MenuItem>
                <MenuItem value="home.sh-moved">Moved</MenuItem>
                <MenuItem value="home.sh-temp">Temp</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid
            item
            xs={5.3}
            sx={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-end",
            }}
          >
            <FormControlLabel
              sx={{ marginRight: "70px" }}
              value="LED"
              control={
                <Switch
                  checked={checked}
                  onChange={handleLEDButton}
                  inputProps={{ "aria-label": "controlled" }}
                />
              }
              label="LED"
              labelPlacement="top"
            />
          </Grid>
        </Grid>

        <Grid item>
          <Chart
            data={device ? chartData : []}
            title={device}
            start={startDateTime}
            end={endDateTime}
          />
        </Grid>
        <Grid
          container
          direction="row"
          alignItems="center"
          justifyContent="center"
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid item sx={{ margin: "10px" }}>
              <DateTimePicker
                label="Start Datetime"
                value={startDateTime}
                onChange={(newValue) => {
                  setStartDateTime(newValue);
                }}
              />
            </Grid>
            <Grid item sx={{ margin: "10px" }}>
              <DateTimePicker
                label="End Datetime"
                value={endDateTime}
                onChange={(newValue) => {
                  setEndDateTime(newValue);
                }}
              />
            </Grid>
          </LocalizationProvider>
        </Grid>

        <Grid item>
          <BasicTable rows={device ? tableData : []} />
        </Grid>
      </Grid>
      <Grid container style={{ height: "100px" }}></Grid>
    </>
  );
}

export default Dashboard;
