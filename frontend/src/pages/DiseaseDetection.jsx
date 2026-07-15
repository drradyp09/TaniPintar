import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../apiConfig";

const HAZARD_STYLES = {
  tinggi: {
    bg: "rgba(229, 57, 53, 0.1)",
    color: "var(--color-error)",
    label: "Bahaya Tinggi",
  },
  sedang: {
    bg: "rgba(251, 140, 0, 0.12)",
    color: "#B45309",
    label: "Bahaya Sedang",
  },
  rendah: {
    bg: "rgba(76, 175, 80, 0.12)",
    color: "var(--color-primary-dark)",
    label: "Bahaya Rendah",
  },
  sehat: {
    bg: "rgba(76, 175, 80, 0.12)",
    color: "var(--color-primary-dark)",
    label: "Sehat",
  },
};

const InfoBlock = ({ title, text }) => (
  <div style={{ marginBottom: "1rem" }}>
    <div
      style={{
        fontWeight: "800",
        fontSize: "0.9rem",
        color: "var(--color-text)",
        marginBottom: "0.3rem",
      }}
    >
      {title}
    </div>
    <p
      style={{
        margin: 0,
        fontSize: "0.88rem",
        color: "var(--color-text-light)",
        lineHeight: "1.5",
        fontWeight: "500",
      }}
    >
      {text}
    </p>
  </div>
);

const StepList = ({ title, items }) => (
  <div style={{ marginBottom: "1rem" }}>
    <div
      style={{
        fontWeight: "800",
        fontSize: "0.9rem",
        color: "var(--color-text)",
        marginBottom: "0.4rem",
      }}
    >
      {title}
    </div>
    <ul
      style={{
        margin: 0,
        paddingLeft: "1.1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.4rem",
      }}
    >
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            fontSize: "0.88rem",
            color: "var(--color-text-light)",
            lineHeight: "1.45",
            fontWeight: "500",
          }}
        >
          {item}
        </li>
      ))}
    </ul>
  </div>
);

const DiseaseDetails = ({ details }) => {
  const hazard = HAZARD_STYLES[details.tingkat_bahaya] || HAZARD_STYLES.sedang;

  return (
    <div
      style={{
        marginTop: "1.4rem",
        padding: "1.3rem",
        background: "var(--color-white)",
        borderRadius: "16px",
        boxShadow: "var(--shadow-soft)",
        border: "1px solid #EDF2F7",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexWrap: "wrap",
          marginBottom: "1rem",
        }}
      >
        {details.tanaman && (
          <span
            style={{
              padding: "5px 12px",
              borderRadius: "20px",
              background: "rgba(46, 125, 50, 0.1)",
              color: "var(--color-primary-dark)",
              fontSize: "0.75rem",
              fontWeight: "800",
            }}
          >
            🌱 {details.tanaman}
          </span>
        )}
        <span
          style={{
            padding: "5px 12px",
            borderRadius: "20px",
            background: hazard.bg,
            color: hazard.color,
            fontSize: "0.75rem",
            fontWeight: "800",
            border: "1px solid currentColor",
          }}
        >
          {hazard.label}
        </span>
        {details.mendesak && (
          <span
            style={{
              padding: "5px 12px",
              borderRadius: "20px",
              background: "rgba(229, 57, 53, 0.12)",
              color: "var(--color-error)",
              fontSize: "0.75rem",
              fontWeight: "800",
              border: "1px solid currentColor",
            }}
          >
            ⚠️ Perlu Tindakan Cepat
          </span>
        )}
      </div>

      {details.penyakit && (
        <InfoBlock title="🦠 Penyakit" text={details.penyakit} />
      )}
      {details.patogen && (
        <InfoBlock title="🔬 Patogen" text={details.patogen} />
      )}
      {details.gejala && <InfoBlock title="🔎 Gejala" text={details.gejala} />}
      {details.penyebab && (
        <InfoBlock title="📌 Penyebab" text={details.penyebab} />
      )}
      {Array.isArray(details.penanganan) && details.penanganan.length > 0 && (
        <StepList title="🛠️ Penanganan" items={details.penanganan} />
      )}
      {Array.isArray(details.pencegahan) && details.pencegahan.length > 0 && (
        <StepList title="🛡️ Pencegahan" items={details.pencegahan} />
      )}

      {details.sumber && (
        <div
          style={{
            marginTop: "0.6rem",
            fontSize: "0.72rem",
            color: "var(--color-text-light)",
            fontStyle: "italic",
            lineHeight: "1.4",
            opacity: 0.75,
          }}
        >
          Sumber: {details.sumber}
        </div>
      )}
    </div>
  );
};

const DiseaseDetection = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState("disease"); // 'disease' or 'chlorophyll'
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleBack = () => {
    navigate("/dashboard");
  };

  // Gallery picker (no `capture`, so Android shows the photo picker / gallery).
  const handleGalleryClick = () => {
    fileInputRef.current.click();
  };

  // Camera capture (`capture` input, opens the camera on both Android and iOS).
  const handleCameraClick = () => {
    cameraInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("image", image);
    formData.append("type", mode);

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/disease-detection/analyze`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        },
      );

      if (response.ok) {
        const data = await response.json();
        setResult(data.result);

        // Update preview with masked image if available
        if (data.segmentation && data.segmentation.masked_image) {
          setPreviewUrl(
            `data:image/jpeg;base64,${data.segmentation.masked_image}`,
          );
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || errorData.message || "Gagal menganalisis gambar.";
        alert(`Error (${response.status}): ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        minHeight: "100vh",
        padding: "1rem",
      }}
    >
      {/* Mobile Container */}
      <div className="mobile-container">
        {/* Header */}
        <div
          className="glass-card animate-stagger-1"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1.2rem",
            padding: "1.2rem",
          }}
        >
          <button
            onClick={handleBack}
            className="scale-hover"
            style={{
              background: "rgba(46, 125, 50, 0.1)",
              borderRadius: "12px",
              width: "44px",
              height: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "1.2rem",
              color: "var(--color-primary)",
              border: "1px solid var(--color-primary-glow)",
            }}
          >
            ←
          </button>
          <h1
            style={{
              fontSize: "1.5rem",
              margin: 0,
              color: "var(--color-text)",
              fontWeight: "800",
              letterSpacing: "-0.5px",
            }}
          >
            Analisis Daun & AI
          </h1>
        </div>

        {/* Mode Selector */}
        <div
          className="glass-card animate-stagger-2"
          style={{
            display: "flex",
            background: "rgba(226, 232, 240, 0.5)",
            padding: "6px",
            borderRadius: "16px",
            marginBottom: "1.8rem",
            backdropFilter: "blur(8px)",
          }}
        >
          <button
            onClick={() => {
              setMode("disease");
              setResult(null);
            }}
            style={{
              flex: 1,
              padding: "0.85rem",
              border: "none",
              borderRadius: "12px",
              background:
                mode === "disease" ? "var(--color-primary)" : "transparent",
              color: mode === "disease" ? "white" : "var(--color-text-light)",
              fontWeight: "700",
              fontSize: "0.95rem",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow:
                mode === "disease"
                  ? "0 4px 12px var(--color-primary-glow)"
                  : "none",
            }}
          >
            🔍 Deteksi Penyakit
          </button>
          <button
            onClick={() => {
              setMode("chlorophyll");
              setResult(null);
            }}
            style={{
              flex: 1,
              padding: "0.85rem",
              border: "none",
              borderRadius: "12px",
              background:
                mode === "chlorophyll" ? "var(--color-primary)" : "transparent",
              color:
                mode === "chlorophyll" ? "white" : "var(--color-text-light)",
              fontWeight: "700",
              fontSize: "0.95rem",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow:
                mode === "chlorophyll"
                  ? "0 4px 12px var(--color-primary-glow)"
                  : "none",
            }}
          >
            🌿 Kadar Klorofil
          </button>
        </div>

        {/* Main Content */}
        <div
          className="glass-card animate-stagger-3"
          style={{
            padding: "1.5rem",
            textAlign: "center",
            marginBottom: "1.5rem",
          }}
        >
          {!previewUrl ? (
            <div
              onClick={handleGalleryClick}
              className="scale-hover"
              style={{
                height: "260px",
                border: "2px dashed var(--color-primary-light)",
                borderRadius: "16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "1.2rem",
                color: "var(--color-text-light)",
                cursor: "pointer",
                background: "rgba(76, 175, 80, 0.03)",
              }}
            >
              <div style={{ fontSize: "3.5rem" }}>📸</div>
              <div>
                <p
                  style={{
                    margin: "0 0 0.4rem 0",
                    fontWeight: "800",
                    color: "var(--color-text)",
                    fontSize: "1.1rem",
                  }}
                >
                  {mode === "disease"
                    ? "Buka Kamera Daun"
                    : "Ukur Kadar Klorofil"}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.85rem",
                    opacity: 0.8,
                    fontWeight: "500",
                  }}
                >
                  Ambil foto secara closeup dan jelas
                </p>
              </div>
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  width: "100%",
                  borderRadius: "16px",
                  maxHeight: "440px",
                  objectFit: "cover",
                  boxShadow: "var(--shadow-soft)",
                  display: "block",
                }}
              />
              <button
                onClick={() => {
                  setPreviewUrl(null);
                  setImage(null);
                  setResult(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                  if (cameraInputRef.current) cameraInputRef.current.value = "";
                }}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: "var(--color-white)",
                  color: "var(--color-error)",
                  border: "none",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  boxShadow: "var(--shadow-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>
          )}

          {!previewUrl && (
            <div style={{ display: "flex", gap: "0.8rem", marginTop: "1rem" }}>
              <button
                type="button"
                onClick={handleGalleryClick}
                className="scale-hover"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.9rem",
                  borderRadius: "14px",
                  border: "1.5px solid var(--color-primary-light)",
                  background: "rgba(76, 175, 80, 0.06)",
                  color: "var(--color-primary-dark)",
                  fontWeight: "800",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                }}
              >
                🖼️ Galeri
              </button>
              <button
                type="button"
                onClick={handleCameraClick}
                className="scale-hover"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.9rem",
                  borderRadius: "14px",
                  border: "none",
                  background:
                    "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
                  color: "var(--color-white)",
                  fontWeight: "800",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                }}
              >
                📷 Kamera
              </button>
            </div>
          )}

          {/* Gallery input: no `capture` so Android opens the photo picker. */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          {/* Camera input: `capture` opens the device camera directly. */}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={cameraInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          {previewUrl && !result && (
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="btn"
              style={{
                marginTop: "1.8rem",
                width: "100%",
                fontSize: "1.1rem",
                padding: "1rem",
                letterSpacing: "0.5px",
              }}
            >
              {loading ? (
                <span
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  Memproses AI...
                </span>
              ) : (
                "Mulai Analisis Sekarang"
              )}
            </button>
          )}

          {result && (
            <div
              className="animate-fade-in"
              style={{
                marginTop: "2rem",
                textAlign: "left",
                padding: "1.5rem",
                borderRadius: "16px",
                background: "rgba(76, 175, 80, 0.05)",
                border: "1px solid var(--color-primary-glow)",
              }}
            >
              <h3
                style={{
                  color: "var(--color-primary-dark)",
                  margin: "0 0 1rem 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  fontWeight: "800",
                }}
              >
                📋 Hasil{" "}
                {mode === "disease" ? "Analisis AI" : "Pengukuran SPAD"}
              </h3>

              {mode === "disease" ? (
                <>
                  <div style={{ marginBottom: "1.2rem" }}>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--color-text-light)",
                        fontWeight: "600",
                        marginBottom: "0.2rem",
                      }}
                    >
                      Penyakit Terdeteksi:
                    </div>
                    <div
                      style={{
                        fontSize: "1.4rem",
                        fontWeight: "800",
                        color: "var(--color-text)",
                        letterSpacing: "-0.3px",
                      }}
                    >
                      {result.name}
                    </div>
                  </div>

                  <div style={{ marginBottom: "1.2rem" }}>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--color-text-light)",
                        fontWeight: "600",
                      }}
                    >
                      Tingkat Keyakinan:
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "10px",
                        background: "rgba(226, 232, 240, 0.8)",
                        borderRadius: "5px",
                        marginTop: "8px",
                        overflow: "hidden",
                        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
                      }}
                    >
                      <div
                        style={{
                          width: `${result.confidence * 100}%`,
                          height: "100%",
                          background:
                            "linear-gradient(90deg, var(--color-primary-light), var(--color-primary))",
                          borderRadius: "5px",
                        }}
                      ></div>
                    </div>
                    <div
                      style={{
                        textAlign: "right",
                        fontSize: "0.8rem",
                        marginTop: "6px",
                        color: "var(--color-primary)",
                        fontWeight: "700",
                      }}
                    >
                      {(result.confidence * 100).toFixed(1)}%
                    </div>
                  </div>

                  {result.details && (
                    <DiseaseDetails details={result.details} />
                  )}
                </>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "1.5rem 0",
                    background: "var(--color-white)",
                    borderRadius: "16px",
                    marginBottom: "1.2rem",
                    boxShadow: "var(--shadow-soft)",
                    border: "1px solid #EDF2F7",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.95rem",
                      color: "var(--color-text-light)",
                      fontWeight: "600",
                    }}
                  >
                    Estimasi Kadar Klorofil
                  </div>
                  <div
                    style={{
                      fontSize: "3.5rem",
                      fontWeight: "900",
                      color: "var(--color-primary)",
                      margin: "0.4rem 0",
                    }}
                  >
                    {result.value}
                  </div>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--color-text-light)",
                      fontWeight: "700",
                    }}
                  >
                    {result.unit}
                  </div>
                  <div
                    style={{
                      marginTop: "0.8rem",
                      padding: "6px 16px",
                      borderRadius: "20px",
                      background:
                        result.status === "Normal"
                          ? "rgba(76, 175, 80, 0.1)"
                          : "rgba(229, 57, 53, 0.1)",
                      color:
                        result.status === "Normal"
                          ? "var(--color-primary-dark)"
                          : "var(--color-error)",
                      fontSize: "0.8rem",
                      fontWeight: "800",
                      border: "1px solid currentColor",
                    }}
                  >
                    Status: {result.status}
                  </div>
                </div>
              )}

              {/* <div style={{
                                background: 'var(--color-white)',
                                padding: '1.2rem',
                                borderRadius: '14px',
                                marginTop: '1.2rem',
                                borderLeft: '5px solid var(--color-primary)',
                                boxShadow: 'var(--shadow-soft)'
                            }}>
                                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '0.4rem' }}>
                                    💡 Rekomendasi Tindakan:
                                </div>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-light)', lineHeight: '1.5', fontWeight: '500' }}>
                                    {result.recommendation}
                                </p>
                            </div> */}

              <div
                style={{
                  marginTop: "1.2rem",
                  fontSize: "0.75rem",
                  color: "var(--color-text-light)",
                  textAlign: "center",
                  fontStyle: "italic",
                  opacity: 0.7,
                }}
              >
                Analisis menggunakan {result.model_info}
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        {!result && (
          <div
            className="glass-card animate-stagger-2"
            style={{
              marginTop: "1.8rem",
              padding: "1.2rem",
              background: "rgba(255,255,255,0.4)",
            }}
          >
            <h4
              style={{
                margin: "0 0 0.8rem 0",
                fontSize: "1rem",
                color: "var(--color-text)",
                fontWeight: "700",
              }}
            >
              Tips Pengambilan Gambar:
            </h4>
            <ul
              style={{
                margin: 0,
                paddingLeft: "1.2rem",
                fontSize: "0.85rem",
                color: "var(--color-text-light)",
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
                textAlign: "left",
                fontWeight: "500",
              }}
            >
              <li>Pastikan pencahayaan terang dan tidak ada bayangan kuat.</li>
              <li>Posisikan daun secara mendatar dan sejajar dengan lensa.</li>
              <li>
                {mode === "disease"
                  ? "Fokuskan pada bagian daun yang mengalami gejala/bercak."
                  : "Ambil bagian daun yang paling representatif untuk pengukuran."}
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiseaseDetection;
