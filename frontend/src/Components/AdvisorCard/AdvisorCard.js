import React from "react";
import { Card, CardContent, Box, Avatar, Typography } from "@mui/material";

const AdvisorCard = ({ advisor, onActionClick }) => (
  <Card
    sx={{
      display: "flex",
      alignItems: "center",
      padding: 2,
      marginBottom: 2,
      boxShadow: 3,
      borderRadius: 2,
      transition: "background-color 0.3s",
      "&:hover": {
        boxShadow: 6,
        backgroundColor: "#f5f5f5",
        cursor: "pointer",
      },
    }}
    onClick={onActionClick}
  >
    <Avatar
      src="https://picsum.photos/200/300"
      alt={`${advisor.name}'s profile`}
      sx={{ width: 80, height: 80, marginRight: 2 }}
    />
    <CardContent sx={{ flexGrow: 1, padding: 0 }}>
      <Typography variant="h6" fontWeight="bold">
        {advisor.name}
      </Typography>
      <Typography>Advisor</Typography>
      <Typography
        variant="body2"
        sx={{
          color: advisor.isactive ? "green" : "red",
          fontWeight: "bold",
        }}
      >
        {advisor.isactive ? "Aktif" : "Meşgul"}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {advisor.email}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        <strong>Görev Günleri:</strong> {advisor.responsible_day?.join(", ")}
      </Typography>
    </CardContent>
  </Card>
);

export default AdvisorCard;
