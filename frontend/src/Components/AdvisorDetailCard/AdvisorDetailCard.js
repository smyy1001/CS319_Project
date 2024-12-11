import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Avatar,
  Divider,
  TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { message } from "antd";
import Axios from "../../Axios";

const AdvisorDetailCard = ({
  advisor,
  setSelectedAdvisor,
  fetchAdvisors,
  onBack,
}) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedAdvisor, setEditedAdvisor] = useState({ ...advisor });

  const handleNotesSave = async () => {
    try {
      await Axios.put(`/api/advisors/edit/${advisor.id}`, {
        notes: editedAdvisor.notes,
      });
      setSelectedAdvisor((prev) => ({
        ...prev,
        notes: editedAdvisor.notes,
      })); // Local olarak notları güncelle
      message.success("Notlar başarıyla güncellendi!");
      setIsEditingNotes(false);
      fetchAdvisors(); // Advisor listesini güncelle
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
            alt={`${advisor.name} Profile`}
            sx={{
              width: 80,
              height: 80,
              marginBottom: 1,
            }}
          />
          <Typography variant="h6" fontWeight="bold">
            {advisor.name}{" "}
            <Typography component="span" variant="body2" color="textSecondary">
              Advisor
            </Typography>
          </Typography>
          <Typography
            variant="body1"
            sx={{
              display: "flex",
              color: advisor.isactive ? "green" : "red",
              fontWeight: "bold",
              justifyContent: "center",
            }}
          >
            {advisor.isactive ? "Aktif" : "Meşgul"}
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
              <strong>Email:</strong> {advisor.email}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Telefon:</strong> {advisor.phone || "-"}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Görev Günleri:</strong>{" "}
              {advisor.responsible_day?.join(", ") || "Belirtilmemiş"}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Notlar:</strong>
            </Typography>
            {isEditingNotes ? (
              <TextField
                fullWidth
                multiline
                rows={4}
                value={editedAdvisor.notes || ""}
                onChange={(e) =>
                  setEditedAdvisor((prev) => ({
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
                {advisor.notes || "Herhangi bir not yok. Tıklayarak ekleyin."}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </>
  );
};

export default AdvisorDetailCard;
