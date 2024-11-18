{/* Avatar display */}
<div>
<img
  src={avatarURL}
  alt="User Avatar"
  style={{ width: '100px', height: '100px', borderRadius: '45%' }}
/>
</div>

{/* Avatar Upload */}  
<form onSubmit={handleSubmit}>
<input type="file" onChange={handleFileChange} accept="image/*" />
<button type="submit">Upload Avatar</button>
</form>