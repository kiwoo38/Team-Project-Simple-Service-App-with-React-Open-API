// src/components1/PostCreatePage.jsx
import React from "react";
import axios from "axios";
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
import { useForm, Controller } from "react-hook-form";

const API_URL = "https://68f1a345b36f9750dee9d045.mockapi.io/api/v1/posts";

export default function PostCreatePage() {
  const {
    control,
    handleSubmit,
    watch,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      writer: "",
      title: "",
      members: "",
      likes: 0,
      createdAt: "",
      eventDate: "",
      endAt: "",
      paymentMethod: "",
      image: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (values) => {
    // 숫자/이미지 정제
    const members = values.members === "" ? 1 : Math.max(1, Number(values.members));
    const likes = values.likes === "" ? 0 : Math.max(0, Number(values.likes));

    let image = (values.image || "").trim().replace(/^"+|"+$/g, "");
    if (image && !image.startsWith("http")) image = "https://" + image;
    if (!image) image = "https://picsum.photos/seed/default/600/400";

    // 날짜 검증
    const today0 = new Date(); today0.setHours(0, 0, 0, 0);
    const ev  = values.eventDate ? new Date(values.eventDate) : null;
    const end = values.endAt ? new Date(values.endAt) : null;

    if (ev && ev < today0) {
      setError("eventDate", { message: "모임 날짜(eventDate)는 오늘 이후여야 해." });
      return;
    }
    if (end && ev && end > ev) {
      setError("endAt", { message: "모집 마감일(endAt)은 모임 날짜(eventDate) 이전/동일이어야 해." });
      return;
    }

    const safeForm = {
      ...values,
      members,
      likes,
      image,
      createdAt: new Date().toISOString(),
      eventDate: ev ? ev.toISOString() : null,
      endAt: end ? end.toISOString() : null,
    };

    try {
      const { status } = await axios.post(API_URL, safeForm, {
        headers: { "Content-Type": "application/json" },
      });
      if (status >= 200 && status < 300) {
        alert("모집글이 성공적으로 등록되었습니다!");
        reset();
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

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2.5}>
              <Controller
                name="writer"
                control={control}
                rules={{ required: "작성자는 필수입니다." }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="작성자"
                    error={!!errors.writer}
                    helperText={errors.writer?.message}
                    fullWidth
                    required
                  />
                )}
              />

              <Controller
                name="title"
                control={control}
                rules={{ required: "제목은 필수입니다." }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="제목"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    fullWidth
                    required
                  />
                )}
              />

              <Controller
                name="members"
                control={control}
                rules={{
                  required: "모집 인원은 필수입니다.",
                  validate: (v) => v === "" || Number(v) >= 1 || "1명 이상이어야 합니다.",
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="모집 인원 (숫자)"
                    inputProps={{ min: 1 }}
                    error={!!errors.members}
                    helperText={errors.members?.message}
                    fullWidth
                    required
                  />
                )}
              />

              <Divider sx={{ my: 1 }} />

              <Controller
                name="endAt"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    label="모집 마감일 (endAt)"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.endAt}
                    helperText={errors.endAt?.message}
                    fullWidth
                  />
                )}
              />

              <Controller
                name="eventDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    label="모임 날짜 (eventDate)"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.eventDate}
                    helperText={errors.eventDate?.message}
                    fullWidth
                  />
                )}
              />

              {/* ▼▼▼ 겹침 해결된 Select (라벨-셀렉트 id 매칭) ▼▼▼ */}
              <FormControl fullWidth required error={!!errors.paymentMethod}>
                <InputLabel id="paymentMethod-label">결제 방식</InputLabel>
                <Controller
                  name="paymentMethod"
                  control={control}
                  rules={{ required: "결제 방식을 선택하세요." }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="paymentMethod-label"   // InputLabel과 동일
                      id="paymentMethod"              // 고유 id
                      label="결제 방식"                // label 명시
                      displayEmpty
                      renderValue={(selected) =>
                        selected ? (
                          selected
                        ) : (
                          <span style={{ color: "rgba(0,0,0,0.38)" }}>
                            결제 방식 선택
                          </span>
                        )
                      }
                    >
                      <MenuItem value="">
                        <em>선택</em>
                      </MenuItem>
                      <MenuItem value="n분의1">n분의1</MenuItem>
                      <MenuItem value="각자결제">각자결제</MenuItem>
                      <MenuItem value="선결제">선결제</MenuItem>
                    </Select>
                  )}
                />
                {errors.paymentMethod && (
                  <Typography variant="caption" color="error">
                    {errors.paymentMethod.message}
                  </Typography>
                )}
              </FormControl>
              {/* ▲▲▲ */}

              <Controller
                name="image"
                control={control}
                render={({ field: { value, onChange, ...rest } }) => (
                  <TextField
                    {...rest}
                    value={value}
                    onChange={(e) => {
                      let v = e.target.value.trim().replace(/^"+|"+$/g, "");
                      if (v && !v.startsWith("http")) v = "https://" + v;
                      onChange(v);
                    }}
                    label="이미지 주소 (예: https://cdn.pixabay.com/...jpg)"
                    fullWidth
                  />
                )}
              />

              {watch("image") && (
                <Box
                  component="img"
                  src={watch("image")}
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
                disabled={isSubmitting}
                sx={{ py: 1.25 }}
              >
                {isSubmitting ? "등록 중..." : "등록하기"}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
