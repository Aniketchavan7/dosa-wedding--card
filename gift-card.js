(() => {
  const form = document.getElementById('gift-form');
  const input = document.getElementById('gift-name');
  const submit = document.getElementById('gift-submit');
  const status = document.getElementById('gift-status');
  const preview = document.getElementById('gift-result-preview');
  const again = document.getElementById('gift-download-again');
  let previousPdfUrl;
  let previousPreviewUrl;

  // One-page, 300-dpi print PDF. The JPEG is embedded without recompression.
  function imagePdf(jpeg) {
    const encode = value => new TextEncoder().encode(value);
    const parts = [];
    let offset = 0;
    const offsets = [0];
    const append = data => { const bytes = typeof data === 'string' ? encode(data) : data; parts.push(bytes); offset += bytes.length; };
    const object = (id, body) => { offsets[id] = offset; append(`${id} 0 obj\n${body}\nendobj\n`); };
    append('%PDF-1.4\n');
    object(1, '<< /Type /Catalog /Pages 2 0 R >>');
    object(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    object(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 360 504] /Resources << /XObject << /Card 4 0 R >> >> /Contents 5 0 R >>');
    offsets[4] = offset;
    append(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width 1500 /Height 2100 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);
    append(jpeg);
    append('\nendstream\nendobj\n');
    const drawing = 'q\n360 0 0 504 0 0 cm\n/Card Do\nQ\n';
    object(5, `<< /Length ${encode(drawing).length} >>\nstream\n${drawing}endstream`);
    const xref = offset;
    append('xref\n0 6\n0000000000 65535 f \n');
    for (let id = 1; id <= 5; id++) append(`${String(offsets[id]).padStart(10, '0')} 00000 n \n`);
    append(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
    return new Blob(parts, {type:'application/pdf'});
  }

  function wrap(ctx, text, width) {
    const lines = [];
    let current = '';
    for (const character of Array.from(text)) {
      const candidate = current + character;
      if (current && ctx.measureText(candidate).width > width) {
        const space = current.lastIndexOf(' ');
        if (space > current.length / 2) { lines.push(current.slice(0,space)); current = current.slice(space + 1) + character; }
        else { lines.push(current); current = character; }
      } else current = candidate;
    }
    if (current) lines.push(current);
    return lines;
  }

  async function renderCard(name) {
    await Promise.all([
      document.fonts.load('90px "Great Vibes"'),
      document.fonts.load('48px "Cormorant Garamond"'),
      document.fonts.load('28px "DM Sans"')
    ]);
    const art = new Image();
    art.src = 'invitation-background.png';
    await art.decode();
    const canvas = document.createElement('canvas');
    canvas.width = 1500;
    canvas.height = 2100;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff6e6'; ctx.fillRect(0,0,1500,2100);
    ctx.drawImage(art,0,0,1500,2100);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const center = 760;
    const line = (text,y,font,color='#214934') => { ctx.font = font; ctx.fillStyle = color; ctx.fillText(text,center,y); };
    line('WITH LOVE AND DUAS',455,'25px "DM Sans", sans-serif','#7b653a');
    line('Doshiba & Suhel',565,'96px "Great Vibes", cursive');
    ctx.strokeStyle='#b69b61';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(530,660);ctx.lineTo(990,660);ctx.stroke();
    line('A special keepsake for',740,'italic 40px "Cormorant Garamond", serif','#667553');
    let size = 73;
    let lines;
    do { ctx.font = `${size}px "Cormorant Garamond", serif`; lines = wrap(ctx,name,740); size -= 2; } while (lines.length > 3 && size >= 39);
    size += 2;
    const lineHeight = size * 1.18;
    lines.forEach((text,index) => line(text,875 + (index-(lines.length-1)/2)*lineHeight,`${size}px "Cormorant Garamond", serif`));
    line('Thank you for being part of our beautiful beginning.',1055,'29px "Cormorant Garamond", serif');
    line('OUR NIKAH',1160,'24px "DM Sans", sans-serif','#7b653a');
    line('Sunday, 15 November 2026',1220,'45px "Cormorant Garamond", serif');
    line('7:00 PM - Followed by dinner',1280,'27px "DM Sans", sans-serif');
    line('Survase\u2019s Surya Club & Resort',1380,'37px "Cormorant Garamond", serif');
    line('12/2, Behind A.G. Patil College',1435,'25px "DM Sans", sans-serif');
    line('Vijayapur Road, Solapur',1477,'25px "DM Sans", sans-serif');
    const prayer = ['May Allah fill our marriage with love,', 'mercy and barakah, and bless everyone', 'who shares our joy.'];
    prayer.forEach((text,index) => line(text,1550+index*40,'italic 28px "Cormorant Garamond", serif','#4c6549'));
    const jpeg = await new Promise(resolve => canvas.toBlob(resolve,'image/jpeg',.96));
    if (!jpeg) throw new Error('Image generation failed');
    return {jpeg, pdf:imagePdf(new Uint8Array(await jpeg.arrayBuffer()))};
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const name = input.value.replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,80);
    if (!name) { input.setCustomValidity('Please enter your name.'); input.reportValidity(); return; }
    input.setCustomValidity('');
    submit.disabled = true;
    submit.textContent = 'Creating your card...';
    status.textContent = 'Adding your name to your keepsake.';
    try {
      const result = await renderCard(name);
      if (previousPdfUrl) URL.revokeObjectURL(previousPdfUrl);
      if (previousPreviewUrl) URL.revokeObjectURL(previousPreviewUrl);
      previousPdfUrl = URL.createObjectURL(result.pdf);
      previousPreviewUrl = URL.createObjectURL(result.jpeg);
      preview.src = previousPreviewUrl;
      preview.alt = `Personalised wedding keepsake for ${name}`;
      preview.hidden = false;
      again.href = previousPdfUrl;
      again.download = `Doshiba-and-Suhel-${name.replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'') || 'Guest'}-Keepsake.pdf`;
      again.hidden = false;
      again.click();
      status.textContent = `Your card for ${name} is ready. The download has started.`;
    } catch (_) {
      status.textContent = 'Your card could not be created. Please try again.';
    } finally {
      submit.disabled = false;
      submit.textContent = 'Personalise & download';
    }
  });
  input.addEventListener('input', () => input.setCustomValidity(''));
})();
