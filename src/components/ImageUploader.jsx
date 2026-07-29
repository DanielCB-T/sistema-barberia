// src/components/ImageUploader.jsx
//
// Reemplaza el campo "URL de imagen" en todos los formularios: el usuario
// elige un archivo de su equipo, se muestra una vista previa inmediata
// (con URL.createObjectURL) y el archivo (File) se guarda en el estado del
// formulario para mandarlo como multipart/form-data al hacer submit.
import { useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';

function ImageUploader({ label = 'Imagen', currentUrl, onChange, dark = false }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(currentUrl || null);

  const handlePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return;
    }

    setPreview(URL.createObjectURL(file));
    onChange(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={dark ? 'field' : 'form-field'}>
      <label style={dark ? { color: 'rgba(250,248,244,0.65)' } : undefined}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 4 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 10,
            border: `1.5px dashed ${dark ? 'rgba(250,248,244,0.35)' : 'var(--border)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
            background: dark ? 'rgba(250,248,244,0.06)' : '#fafafa',
          }}
        >
          {preview ? (
            <img src={preview} alt="Vista previa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <ImagePlus size={22} color={dark ? 'rgba(250,248,244,0.5)' : 'var(--muted)'} />
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            style={dark ? { color: 'var(--bone-50)', borderColor: 'rgba(250,248,244,0.35)' } : undefined}
            onClick={() => inputRef.current?.click()}
          >
            {preview ? 'Cambiar imagen' : 'Subir imagen'}
          </button>
          {preview && (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={handleRemove}
              style={
                dark
                  ? { color: '#ffb4a8', borderColor: 'rgba(250,248,244,0.35)' }
                  : { color: 'var(--danger, #c0392b)' }
              }
            >
              <X size={14} /> Quitar
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handlePick}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}

export default ImageUploader;
