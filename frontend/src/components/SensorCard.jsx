import { useState } from "react";
import { API_BASE_URL } from "../apiConfig";

const SensorCard = ({ sensor, onEdit, onDelete, isSelected, onSelect }) => {
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(sensor.token || "Token not available");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus sensor "${sensor.name}"? Semua data riwayat akan ikut terhapus secara permanen.`,
      )
    ) {
      onDelete(sensor.id);
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`glass-card ${isSelected ? "animate-pulse-glow" : "scale-hover"}`}
      style={{
        padding: "1.5rem",
        marginBottom: "1rem",
        border: isSelected
          ? "2px solid var(--color-primary)"
          : "1px solid var(--color-primary-glow)",
        borderLeftWidth: "6px",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        background: isSelected
          ? "rgba(76, 175, 80, 0.05)"
          : "rgba(255, 255, 255, 0.7)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1.2rem",
        }}
      >
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: "800",
              color: "var(--color-text)",
              margin: "0 0 0.3rem 0",
              letterSpacing: "-0.3px",
            }}
          >
            {sensor.name}
          </h3>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--color-text-light)",
              margin: 0,
              fontFamily: "monospace",
              fontWeight: "600",
              letterSpacing: "0.5px",
            }}
          >
            ID: {sensor.device_id}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.6rem" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="scale-hover"
            style={{
              padding: "0.6rem",
              background: "rgba(226, 232, 240, 0.3)",
              border: "1px solid var(--color-primary-glow)",
              borderRadius: "10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            title="Edit Sensor"
          >
            ✏️
          </button>
          <button
            onClick={handleDelete}
            className="scale-hover"
            style={{
              padding: "0.6rem",
              background: "rgba(229, 57, 53, 0.05)",
              border: "1px solid rgba(229, 57, 53, 0.2)",
              borderRadius: "10px",
              color: "var(--color-error)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            title="Hapus Sensor"
          >
            🗑️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowToken(!showToken);
            }}
            className="btn"
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.75rem",
              fontWeight: "700",
              background: showToken
                ? "var(--color-text)"
                : "var(--color-primary)",
              boxShadow: showToken ? "none" : "var(--shadow-glow)",
            }}
          >
            {showToken ? "🔒 TUTUP" : "🔑 TOKEN"}
          </button>
        </div>
      </div>

      {/* IoT Connectivity Guide */}
      {showToken && (
        <div
          className="glass-card animate-fade-in"
          style={{
            background: "rgba(248, 250, 252, 0.95)",
            border: "2px solid var(--color-primary)",
            padding: "1.25rem",
            marginBottom: "1.2rem",
            boxShadow: "var(--shadow-glow)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.2rem",
            }}
          >
            <h4
              style={{
                margin: 0,
                color: "var(--color-text)",
                fontSize: "1.1rem",
                fontWeight: "800",
              }}
            >
              🚀 IoT Connection Hub
            </h4>
            <button
              onClick={() => setShowToken(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "1.2rem",
                color: "var(--color-text-light)",
              }}
            >
              ✕
            </button>
          </div>

          {/* 1. API Token */}
          <div style={{ marginBottom: "1.2rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.5rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  color: "var(--color-text-light)",
                }}
              >
                🔑 X-Sensor-Token
              </span>
              <button
                onClick={handleCopyToken}
                className="btn"
                style={{
                  padding: "0.3rem 0.8rem",
                  fontSize: "0.7rem",
                  background: copied
                    ? "var(--color-primary)"
                    : "var(--color-text)",
                  boxShadow: "none",
                }}
              >
                {copied ? "✓ COPIED" : "📋 COPY"}
              </button>
            </div>
            <code
              style={{
                display: "block",
                wordBreak: "break-all",
                background: "#ffffff",
                padding: "0.8rem",
                borderRadius: "8px",
                fontSize: "0.8rem",
                border: "1px solid var(--color-primary-glow)",
                color: "var(--color-primary-dark)",
                fontFamily: "monospace",
                fontWeight: "600",
              }}
            >
              {sensor.token}
            </code>
          </div>

          {/* 2. Endpoint & Payload */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "1rem",
              marginBottom: "1.2rem",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  color: "var(--color-text-light)",
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                🌐 API Endpoint
              </span>
              <code
                style={{
                  display: "block",
                  background: "var(--color-text)",
                  padding: "0.8rem",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  color: "rgba(255,255,255,0.9)",
                  fontWeight: "600",
                }}
              >
                POST /api/auth/v1/telemetry
              </code>
            </div>
          </div>

          {/* 3. Example Command */}
          <div>
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: "700",
                color: "var(--color-text-light)",
                display: "block",
                marginBottom: "0.5rem",
              }}
            >
              💻 PowerShell Command
            </span>
            <div style={{ position: "relative" }}>
              <pre
                style={{
                  margin: 0,
                  background: "#1a202c",
                  color: "#e2e8f0",
                  padding: "1.2rem",
                  borderRadius: "10px",
                  fontSize: "0.75rem",
                  overflowX: "auto",
                  fontFamily: "monospace",
                  lineHeight: "1.6",
                  border: "1px solid #2d3748",
                }}
              >
                {`Invoke-RestMethod -Uri "${API_BASE_URL}/telemetry" \`
-Method Post \`
-Headers @{"X-Sensor-Token"="${sensor.token}"} \`
-ContentType "application/json" \`
-Body '${(() => {
                  const config = sensor.sensor_config || {
                    temperature: { enabled: true },
                    humidity: { enabled: true },
                  };
                  const payload = {};
                  Object.keys(config).forEach((k) => {
                    if (config[k].enabled) payload[k] = 25.0;
                  });
                  return JSON.stringify(payload);
                })()}'`}
              </pre>
              <button
                onClick={() => {
                  const config = sensor.sensor_config || {
                    temperature: { enabled: true },
                    humidity: { enabled: true },
                  };
                  const p = {};
                  Object.keys(config).forEach((k) => {
                    if (config[k].enabled) p[k] = 25.0;
                  });
                  const cmd = `Invoke-RestMethod -Uri "${API_BASE_URL}/telemetry" \`-Method Post \`-Headers @{"X-Sensor-Token"="${sensor.token}"} \`-ContentType "application/json" \`-Body '${JSON.stringify(p)}'`;
                  navigator.clipboard.writeText(cmd.replace(/`/g, "`\n"));
                }}
                style={{
                  position: "absolute",
                  top: "0.6rem",
                  right: "0.6rem",
                  padding: "0.4rem 0.6rem",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "6px",
                  color: "white",
                  fontSize: "0.7rem",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                SALIN
              </button>
            </div>
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--color-text-light)",
                marginTop: "0.8rem",
                fontStyle: "italic",
                lineHeight: "1.4",
              }}
            >
              💡 Integrasikan alat (ESP32, Arduino, dll) Anda dengan platform
              IoT TaniPintar.
            </p>
          </div>
        </div>
      )}

      {/* Sensor Data */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "0.8rem",
          marginBottom: "1rem",
        }}
      >
        {sensor.latest_data ? (
          (() => {
            const paramMetadata = {
              temperature: {
                label: "Suhu",
                unit: "°C",
                bg: "rgba(255, 152, 0, 0.08)",
                text: "#e65100",
                border: "rgba(255, 152, 0, 0.2)",
              },
              humidity: {
                label: "Lembab",
                unit: "%",
                bg: "rgba(33, 150, 243, 0.08)",
                text: "#0277bd",
                border: "rgba(33, 150, 243, 0.2)",
              },
              soil_ph: {
                label: "pH Tanah",
                unit: "",
                bg: "rgba(156, 39, 176, 0.08)",
                text: "#6a1b9a",
                border: "rgba(156, 39, 176, 0.2)",
              },
              rainfall: {
                label: "Hujan",
                unit: "mm",
                bg: "rgba(0, 188, 212, 0.08)",
                text: "#006064",
                border: "rgba(0, 188, 212, 0.2)",
              },
              wind_speed: {
                label: "Angin",
                unit: "m/s",
                bg: "rgba(76, 175, 80, 0.08)",
                text: "#33691e",
                border: "rgba(76, 175, 80, 0.2)",
              },
              soil_moisture: {
                label: "Lembab Tanah",
                unit: "%",
                bg: "rgba(63, 81, 181, 0.08)",
                text: "#1a237e",
                border: "rgba(63, 81, 181, 0.2)",
              },
              light_intensity: {
                label: "Cahaya",
                unit: "lux",
                bg: "rgba(255, 235, 59, 0.12)",
                text: "#f57f17",
                border: "rgba(255, 235, 59, 0.3)",
              },
              pressure: {
                label: "Tekanan",
                unit: "hPa",
                bg: "rgba(121, 85, 72, 0.08)",
                text: "#3e2723",
                border: "rgba(121, 85, 72, 0.2)",
              },
            };

            const config = sensor.sensor_config || {};
            const hasConfig = Object.keys(config).length > 0;
            const keys = Object.keys(paramMetadata);
            const dataToShow = keys.filter((key) => {
              if (hasConfig) {
                return config[key] && config[key].enabled;
              }
              return (
                sensor.latest_data[key] !== null &&
                sensor.latest_data[key] !== undefined
              );
            });

            if (dataToShow.length === 0) {
              return (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    padding: "1rem",
                    color: "var(--color-text-light)",
                    fontSize: "0.85rem",
                    fontStyle: "italic",
                  }}
                >
                  Tidak ada data aktif
                </div>
              );
            }

            return dataToShow.map((key) => {
              const meta = paramMetadata[key];
              const value = sensor.latest_data[key];
              return (
                <div
                  key={key}
                  style={{
                    background: meta.bg,
                    padding: "1rem",
                    borderRadius: "12px",
                    border: `1px solid ${meta.border}`,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.4rem",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: meta.text,
                      fontWeight: "800",
                      opacity: 0.8,
                    }}
                  >
                    {meta.label.toUpperCase()}
                  </div>
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: "900",
                      color: meta.text,
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {typeof value === "number" ? value.toFixed(1) : value}
                    <span
                      style={{
                        fontSize: "0.85rem",
                        marginLeft: "2px",
                        fontWeight: "600",
                      }}
                    >
                      {meta.unit}
                    </span>
                  </div>
                </div>
              );
            });
          })()
        ) : (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "1.5rem",
              color: "var(--color-text-light)",
              fontSize: "0.9rem",
              fontStyle: "italic",
              background: "rgba(0,0,0,0.02)",
              borderRadius: "12px",
            }}
          >
            Menunggu data transmisi...
          </div>
        )}
      </div>

      {/* GPS Location & Status */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "1rem",
        }}
      >
        {sensor.latitude && sensor.longitude ? (
          <div
            style={{
              background: "rgba(46, 125, 50, 0.08)",
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "0.75rem",
              color: "var(--color-primary-dark)",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span style={{ fontSize: "0.9rem" }}>📍</span>{" "}
            {sensor.latitude.toFixed(4)}°, {sensor.longitude.toFixed(4)}°
          </div>
        ) : (
          <div />
        )}

        {sensor.latest_data && (
          <div
            style={{
              fontSize: "0.7rem",
              color: "var(--color-text-light)",
              fontWeight: "600",
              opacity: 0.8,
            }}
          >
            🕒 Updated:{" "}
            {new Date(sensor.latest_data.timestamp).toLocaleTimeString("id-ID")}
          </div>
        )}
      </div>
    </div>
  );
};

export default SensorCard;
