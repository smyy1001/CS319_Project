import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Modal,
  TextField,
  Autocomplete,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { message } from "antd";
import Axios from "../../Axios";

const GuideDetailCard = ({
  role,
  guide,
  setSelectedGuide,
  fetchGuides,
  onBack,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [modalOpen, setModalOpen] = useState(false);
  const [days, setDays] = useState([]);
  const [editedGuide, setEditedGuide] = useState({ ...guide });
  const [isEditingNotes, setIsEditingNotes] = useState(false); // New state for notes editing

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const makeAdvisor = () => {
    setSelectedGuide(null); // Clear the selected guide
    Axios.post(`/api/guides/make_advisor/${guide.id}`, { days: days })
      .then(() => {
        message.success("Advisor başarıyla oluşturuldu.");
        fetchGuides();
      })
      .catch((error) => {
        console.error("Advisor yapılamadı:", error);
      });
  };

  const handleDayChange = (event, value) => {
    setDays(value.map((option) => option.value));
  };

  const handleNotesSave = async () => {
    try {
      await Axios.put(`/api/guides/edit_profile/${guide.id}`, {
        notes: editedGuide.notes,
      });
      message.success(
        "Notlar başarıyla güncellendi! Lütfen sayfayı yenileyin."
      );
      setIsEditingNotes(false);
      fetchGuides(); // Refresh the guide list
    } catch (error) {
      console.error("Notlar güncellenemedi:", error);
      message.error("Notlar güncellenemedi. Lütfen tekrar deneyin.");
    }
  };

  return (
    <>
      <Card
        sx={{
          padding: 3,
          borderRadius: 2,
          boxShadow: 2,
          backgroundColor: "#fff",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          marginBottom={2}
        >
          <Button
            variant="text"
            onClick={onBack}
            sx={{ fontSize: "1rem", color: "text.primary" }}
          >
            <ArrowBackIcon sx={{ fontSize: 30 }} />
          </Button>
          <IconButton onClick={handleMenuClick}>
            <MoreHorizIcon sx={{ fontSize: 30 }} />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem onClick={makeAdvisor}>Advisor Yap</MenuItem>
            <MenuItem onClick={handleMenuClose}>Hesabını Sil</MenuItem>
          </Menu>
        </Box>

        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          marginBottom={3}
        >
          <Avatar
            src="https://picsum.photos/200/300"
            alt={`${guide.name} Profile`}
            sx={{
              width: 80,
              height: 80,
              marginBottom: 1,
            }}
          />
          <Typography variant="h6" fontWeight="bold">
            {guide.name}{" "}
            <Typography component="span" variant="body2" color="textSecondary">
              {role === "guide" ? "Rehber" : "Advisor"}
            </Typography>
          </Typography>
          <Typography
            variant="body1"
            sx={{
              display: "flex",
              color: guide.isactive ? "green" : "red",
              fontWeight: "bold",
              justifyContent: "center",
            }}
          >
            {guide.isactive ? "Müsait" : "Meşgul"}
          </Typography>
        </Box>

        <Divider
          sx={{
            marginBottom: 2,
            borderBottomWidth: 2,
            borderColor: "rgba(0, 0, 0, 0.8)",
          }}
        />

        <CardContent>
          <Box sx={{ lineHeight: 1.6, color: "text.secondary" }}>
            <Typography variant="body1" gutterBottom>
              <strong>Email:</strong> {guide.email}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Rating:</strong> {guide.guide_rating} ⭐
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Cep Telefonu:</strong> {guide.phone || "-"}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Notlar:</strong>
            </Typography>
            {isEditingNotes ? (
              <TextField
                fullWidth
                multiline
                rows={4}
                value={editedGuide.notes || ""}
                onChange={(e) =>
                  setEditedGuide((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                onBlur={handleNotesSave}
                variant="outlined"
                placeholder="Notları düzenlemek için yazın..."
              />
            ) : (
              <Typography
                variant="body1"
                onClick={() => setIsEditingNotes(true)}
                sx={{
                  backgroundColor: "#f5f5f5",
                  padding: 1,
                  borderRadius: 1,
                  cursor: "pointer",
                }}
              >
                {guide.notes || "Herhangi bir not yok. Tıklayarak ekleyin."}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </>
  );
};

export default GuideDetailCard;
