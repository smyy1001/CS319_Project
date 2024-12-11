import React from "react";
import { Card, CardContent, Box, Avatar, Typography } from "@mui/material";
// import OpenInFullIcon from "@mui/icons-material/OpenInFull";

const GuideCard = ({ guide, onActionClick }) => (
  <Card
    sx={{
      display: "flex",
      alignItems: "center",
      padding: 2,
      marginBottom: 2,
      boxShadow: 3, // Sabit gölge seviyesi
      borderRadius: 2,
      transition: "background-color 0.3s",
      "&:hover": {
        boxShadow: 6, // Deeper shadow on hover
        backgroundColor: "#f5f5f5", // Gray background on hover
        cursor: "pointer",
      },
    }}
    onClick={onActionClick} // Make the card clickable
  >
    {/* Left Section: Avatar and Info */}
    <Avatar
      src="https://picsum.photos/200/300" // Placeholder image
      alt={`${guide.name}'s profile`}
      sx={{ width: 80, height: 80, marginRight: 2 }}
    />
    <CardContent sx={{ flexGrow: 1, padding: 0 }}>
      <Typography variant="h6" fontWeight="bold">
        {guide.name}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: guide.isactive ? "green" : "red", // Green for "Müsait", Red for "Meşgul"
          fontWeight: "bold", // Optional: Make the text bold for better visibility
        }}
      >
        {guide.isactive ? "Müsait" : "Meşgul"}
      </Typography>
      <Typography>
        {localStorage.getItem("role") === "guide" ? "Rehber" : "Advisor"}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {guide.email}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        <strong>Rating:</strong> {guide.guide_rating} ⭐
      </Typography>
    </CardContent>

    {/* Right Section: Action and Status */}
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="space-between"
    ></Box>
  </Card>
);

export default GuideCard;
