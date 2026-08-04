// components/SpecialtiesSection.tsx
"use client";

import { useState } from "react";
import {
  Container,
  Typography,
  Stack,
  Box,
  Collapse,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Chip,
  IconButton,
} from "@mui/material";
import { teamSpecialties, teamLawyers } from "@/data/team";

export default function SpecialtiesSection() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(
    null,
  );

  const lawyersForSpecialty = selectedSpecialty
    ? teamLawyers.filter((lawyer) =>
        lawyer.specialties.includes(selectedSpecialty),
      )
    : [];

  const handleToggle = (area: string) => {
    setSelectedSpecialty((prev) => (prev === area ? null : area));
  };

  return (
    <Container>
      <Typography variant="h4" textAlign="center" mb={4}>
        Nossa Equipe
      </Typography>
      <Typography variant="h6" textAlign="center" mb={6}>
        Selecione uma especialidade para conhecer os responsáveis
      </Typography>

      <Stack direction="row" flexWrap="wrap" gap={2} justifyContent="center">
        {teamSpecialties.map((area, i) => {
          const isSelected = selectedSpecialty === area;
          return (
            <Box
              key={i}
              onClick={() => handleToggle(area)}
              sx={{
                width: { xs: "45%", md: "30%" },
                p: 3,
                textAlign: "center",
                borderRadius: 2,
                bgcolor: isSelected ? "primary.main" : "background.paper",
                border: "1px solid",
                borderColor: isSelected ? "primary.main" : "divider",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  borderColor: "primary.main",
                  boxShadow: 3,
                  transform: "translateY(-4px)",
                },
              }}
            >
              <Typography
                fontWeight="bold"
                color={isSelected ? "primary.contrastText" : "text.primary"}
              >
                {area}
              </Typography>
            </Box>
          );
        })}
      </Stack>

      {selectedSpecialty && (
        <Box mt={5}>
          <Box
            sx={{
              borderTop: "1px solid",
              borderColor: "divider",
              pt: 4,
            }}
          >
            <Typography variant="h5" fontWeight={700} textAlign="center" mb={4}>
              Especialistas em {selectedSpecialty}
            </Typography>

            {lawyersForSpecialty.length === 0 ? (
              <Typography color="text.secondary" textAlign="center">
                Nenhum advogado encontrado.
              </Typography>
            ) : (
              <Stack
                direction="row"
                flexWrap="wrap"
                justifyContent="center"
                gap={3}
              >
                {lawyersForSpecialty.map((lawyer) => (
                  <Box
                    key={lawyer.id}
                    sx={{
                      width: {
                        xs: "100%",
                        sm: "45%",
                        md: "30%",
                      },
                      p: 3,
                      borderRadius: 2,
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      textAlign: "center",
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    <Stack alignItems="center" spacing={1.5}>
                      <Avatar
                        src={lawyer.image}
                        alt={lawyer.name}
                        sx={{
                          width: 90,
                          height: 90,
                        }}
                      />

                      <Typography fontWeight={700} fontSize="1.05rem">
                        {lawyer.name}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {lawyer.role}
                      </Typography>

                      <Typography variant="body2" color="primary">
                        {lawyer.oab}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          maxWidth: 260,
                        }}
                      >
                        {lawyer.description}
                      </Typography>

                     
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          <Box
            sx={{
              borderBottom: "1px solid",
              borderColor: "divider",
              mt: 5,
            }}
          />
        </Box>
      )}
    </Container>
  );
}
