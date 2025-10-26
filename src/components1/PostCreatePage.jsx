import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";

const API_URL = "https://68f1a345b36f9750dee9d045.mockapi.io/api/v1/posts";

export default function PostCreatePage() {
  const [form, setForm] = useState({
    writer: "",
    title: "",
    members: "",
    likes: 0,
    createdAt: "",
    eventDate: "",
    endAt: "",
    paymentMethod: "",
    image: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // 숫자 필드 정규화
    if (name === "members" || name === "likes") {
      const num = value === "" ? "" : Math.max(0, Number(value));
      setForm((f) => ({ ...f, [name]: num }));
      return;
    }

    // 이미지 입력 정리
    if (name === "image") {
      let clean = value.trim().replace(/^"+|"+$/g, "");
      if (clean && !clean.startsWith("http")) clean = "https://" + clean;
      setForm((f) => ({ ...f, [name]: clean }));
      return;
    }

    // 그 외 공통
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 날짜 검증
    const today0 = new Date();
    today0.setHours(0, 0, 0, 0);

    if (form.eventDate) {
      const ev = new Date(form.eventDate);
      if (ev < today0) {
        alert("모임 날짜(eventDate)는 오늘 이후여야 해.");
        return;
      }
    }
    if (form.endAt && form.eventDate) {
      const end = new Date(form.endAt);
      const ev = new Date(form.eventDate);
      if (end > ev) {
        alert("모집 마감일(endAt)은 모임 날짜(eventDate) 이전/동일이어야 해.");
        return;
      }
    }

    const safeForm = {
      ...form,
      members: form.members === "" ? 1 : Number(form.members),
      likes: form.likes === "" ? 0 : Number(form.likes),
      image: form.image || "https://picsum.photos/seed/default/600/400",
      createdAt: new Date().toISOString(),
      eventDate: form.eventDate ? new Date(form.eventDate).toISOString() : null,
      endAt: form.endAt ? new Date(form.endAt).toISOString() : null,
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(safeForm),
      });

      if (res.ok) {
        alert("모집글이 성공적으로 등록되었습니다!");
        window.location.href = "/";
      } else {
        alert("등록 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("등록 실패:", error);
      alert("서버 연결에 실패했습니다.");
    }
  };

  return (
    <Box maxWidth={840} mx="auto" mt={6} px={2}>
      <Card elevation={2} sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} align="center" gutterBottom>
            ✍️ 모집글 등록
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                label="작성자"
                name="writer"
                value={form.writer}
                onChange={handleChange}
                required
                fullWidth
              />

              <TextField
                label="제목"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                fullWidth
              />

              <TextField
                label="모집 인원 (숫자)"
                name="members"
                type="number"
                value={form.members}
                onChange={handleChange}
                required
                inputProps={{ min: 1 }}
                fullWidth
              />

              <Divider sx={{ my: 1 }} />

              {/* 모집 마감일 */}
              <TextField
                label="모집 마감일 (endAt)"
                name="endAt"
                type="date"
                value={form.endAt}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />

              {/* 모임 날짜 */}
              <TextField
                label="모임 날짜 (eventDate)"
                name="eventDate"
                type="date"
                value={form.eventDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />

              <FormControl fullWidth required>
                <InputLabel id="pm-label">결제 방식</InputLabel>
                <Select
                  labelId="pm-label"
                  label="결제 방식"
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleChange}
                >
                  <MenuItem value="">
                    <em>선택</em>
                  </MenuItem>
                  <MenuItem value="n분의1">n분의1</MenuItem>
                  <MenuItem value="각자결제">각자결제</MenuItem>
                  <MenuItem value="선결제">선결제</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="이미지 주소 (예: https://cdn.pixabay.com/...jpg)"
                name="image"
                value={form.image}
                onChange={handleChange}
                fullWidth
              />

              {form.image && (
                <Box
                  component="img"
                  src={form.image}
                  alt="미리보기"
                  sx={{
                    width: "100%",
                    maxHeight: 260,
                    objectFit: "cover",
                    borderRadius: 2,
                    border: "1px solid rgba(0,0,0,0.12)",
                  }}
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              )}

              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{ py: 1.25 }}
              >
                등록하기
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
