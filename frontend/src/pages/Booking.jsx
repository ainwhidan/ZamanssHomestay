import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import API from '../api';
import './Booking.css';

const BANK_INFO = {
  bank: 'Maybank',
  accountName: 'Zamanss Homestay',
  accountNumber: '1234 5678 9012',
};

const QR_IMAGE = '/images/qr-payment.png';

function Booking() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();

  const homestayId = searchParams.get('id');
  const checkinParam  = searchParams.get('checkin')  || '';
  const checkoutParam = searchParams.get('checkout') || '';
  const guestsParam   = parseInt(searchParams.get('guests') || 1);

  const [hs,          setHs]          = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [step,        setStep]        = useState(1); // 1=details, 2=payment, 3=success
  const [paymentMethod, setPaymentMethod] = useState('qr');
  const [receipt,     setReceipt]     = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [bookingId,   setBookingId]   = useState(null);
  const [error,       setError]       = useState('');

  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    checkin:  checkinParam,
    checkout: checkoutParam,
    guests:   guestsParam,
  });

  // Check login
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate(`/login?redirect=/booking?id=${homestayId}`);
      return;
    }

    if (!homestayId) {
      navigate('/homestays');
      return;
    }

    API.get(`/homestays/${homestayId}`)
      .then(res => setHs(res.data))
      .catch(() => navigate('/homestays'))
      .finally(() => setLoading(false));
  }, [homestayId]);

  const nights = (() => {
    if (!form.checkin || !form.checkout) return 0;
    const n = Math.ceil((new Date(form.checkout) - new Date(form.checkin)) / 86400000);
    return n > 0 ? n : 0;
  })();

  const totalPrice = hs ? Math.round(hs.price_per_night * nights) : 0;

  const handleReceiptChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceipt(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitBooking = async () => {
  setError('');
  if (!form.checkin || !form.checkout) return setError('Please select check-in and check-out dates.');
  if (nights <= 0) return setError('Check-out must be after check-in.');
  if (!receipt) return setError('Please upload your payment receipt.');

  setSubmitting(true);

  try {
    const token = localStorage.getItem('token');

    // Guna FormData untuk hantar file
    const formData = new FormData();
    formData.append('homestay_id',   homestayId);
    formData.append('checkin_date',  form.checkin);
    formData.append('checkout_date', form.checkout);
    formData.append('num_guests',    form.guests);
    formData.append('total_price',   totalPrice);
    formData.append('receipt',       receipt); // file

    const availRes = await API.get(`/bookings/availability?homestay_id=${homestayId}`);
    const clash = availRes.data.some(b =>
      new Date(form.checkin)  < new Date(b.checkout_date) &&
      new Date(form.checkout) > new Date(b.checkin_date)
    );

    if (clash) {
      setSubmitting(false);
      return setError('Sorry, these dates are no longer available. Please go back and choose different dates.');
    }

    const res = await API.post('/bookings', formData, {
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      }
    });

    setBookingId(res.data.booking_id);
    setStep(3);
  } catch (err) {
    setError(err.response?.data?.error || 'Something went wrong.');
  } finally {
    setSubmitting(false);
  }
};

  if (loading) return <div className="booking-loading">Loading...</div>;
  if (!hs)     return null;

  return (
    <div className="booking-page">
      <div className="container">

        {/* BREADCRUMB */}
        <div className="booking-breadcrumb">
          <Link to="/">Home</Link> ›
          <Link to="/homestays">Homestays</Link> ›
          <Link to={`/homestays/${homestayId}`}>{hs.name}</Link> ›
          <span>Booking</span>
        </div>

        {/* PROGRESS STEPS */}
        <div className="booking-steps">
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>
            <div className="step-num">1</div>
            <span>Booking Details</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}>
            <div className="step-num">2</div>
            <span>Payment</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-num">3</div>
            <span>Confirmation</span>
          </div>
        </div>

        <div className="booking-layout">

          {/* LEFT — FORM */}
          <div className="booking-main">

            {/* STEP 1 — BOOKING DETAILS */}
            {step === 1 && (
              <div className="booking-section">
                <h2>📅 Booking Details</h2>

                <div className="booking-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Check-in Date</label>
                      <input type="date" min={today}
                        value={form.checkin}
                        onChange={e => setForm({...form, checkin: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Check-out Date</label>
                      <input type="date" min={form.checkin || today}
                        value={form.checkout}
                        onChange={e => setForm({...form, checkout: e.target.value})} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Number of Guests</label>
                    <select value={form.guests} onChange={e => setForm({...form, guests: parseInt(e.target.value)})}>
                      {Array.from({length: hs.max_guests}, (_, i) => i + 1).map(g => (
                        <option key={g} value={g}>{g} Guest{g > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  {nights > 0 && (
                    <div className="nights-info">
                      🌙 <strong>{nights} night{nights > 1 ? 's' : ''}</strong> stay selected
                    </div>
                  )}
                </div>

                {error && <div className="alert alert-error">⚠️ {error}</div>}

                <button className="btn-next"
                  onClick={() => {
                    if (!form.checkin || !form.checkout) return setError('Please select dates.');
                    if (nights <= 0) return setError('Check-out must be after check-in.');
                    setError('');
                    setStep(2);
                  }}>
                  Continue to Payment →
                </button>
              </div>
            )}

            {/* STEP 2 — PAYMENT */}
            {step === 2 && (
              <div className="booking-section">
                <h2>💳 Payment</h2>
                <p className="payment-note">Please complete payment and upload your receipt to confirm booking.</p>

                {/* PAYMENT METHOD TOGGLE */}
                <div className="payment-tabs">
                  <button
                    className={`payment-tab ${paymentMethod === 'qr' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('qr')}>
                    📱 QR Pay
                  </button>
                  <button
                    className={`payment-tab ${paymentMethod === 'transfer' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('transfer')}>
                    🏦 Bank Transfer
                  </button>
                </div>

                {/* QR PAY */}
                {paymentMethod === 'qr' && (
                  <div className="payment-box">
                    <h3>Scan QR to Pay</h3>
                    <p>Use any banking app or e-wallet to scan the QR code below.</p>
                    <div className="qr-wrap">
                      <img src={QR_IMAGE}
                        alt="QR Payment"
                        onError={e => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }} />
                      <div className="qr-placeholder" style={{display:'none'}}>
                        <span>📱</span>
                        <p>QR Code</p>
                        <small>Add your QR image at<br/>/public/images/qr-payment.png</small>
                      </div>
                    </div>
                    <div className="payment-amount">
                      Amount to pay: <strong>RM {totalPrice}</strong>
                    </div>
                  </div>
                )}

                {/* BANK TRANSFER */}
                {paymentMethod === 'transfer' && (
                  <div className="payment-box">
                    <h3>Bank Transfer Details</h3>
                    <p>Transfer the exact amount to the account below.</p>
                    <div className="bank-details">
                      <div className="bank-row">
                        <span>Bank</span>
                        <strong>{BANK_INFO.bank}</strong>
                      </div>
                      <div className="bank-row">
                        <span>Account Name</span>
                        <strong>{BANK_INFO.accountName}</strong>
                      </div>
                      <div className="bank-row">
                        <span>Account Number</span>
                        <strong className="acc-num">{BANK_INFO.accountNumber}
                          <button className="copy-btn" onClick={() => {
                            navigator.clipboard.writeText(BANK_INFO.accountNumber.replace(/\s/g,''));
                            alert('Account number copied!');
                          }}>📋 Copy</button>
                        </strong>
                      </div>
                      <div className="bank-row highlight">
                        <span>Amount</span>
                        <strong>RM {totalPrice}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* UPLOAD RECEIPT */}
                <div className="receipt-upload">
                  <h3>📎 Upload Payment Receipt</h3>
                  <p>Upload a screenshot or photo of your payment confirmation.</p>

                  <label className="upload-area">
                    {receiptPreview ? (
                      <img src={receiptPreview} alt="Receipt preview" className="receipt-preview" />
                    ) : (
                      <div className="upload-placeholder">
                        <span>📤</span>
                        <p>Click to upload receipt</p>
                        <small>JPG, PNG, PDF (max 5MB)</small>
                      </div>
                    )}
                    <input type="file" accept="image/*,.pdf"
                      onChange={handleReceiptChange} style={{display:'none'}} />
                  </label>

                  {receipt && (
                    <p className="receipt-name">✅ {receipt.name}</p>
                  )}
                </div>

                {error && <div className="alert alert-error">⚠️ {error}</div>}

                <div className="booking-btns">
                  <button className="btn-back" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn-next" onClick={handleSubmitBooking} disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Confirm Booking ✓'}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 — SUCCESS */}
            {step === 3 && (
              <div className="booking-success">
                <div className="success-icon">🎉</div>
                <h2>Booking Submitted!</h2>
                <p>Thank you! Your booking has been received and is <strong>pending confirmation</strong>.</p>
                <p>We will review your payment receipt and confirm within <strong>24 hours</strong>.</p>

                <div className="success-details">
                  <div className="success-row">
                    <span>Booking ID</span>
                    <strong>#{bookingId}</strong>
                  </div>
                  <div className="success-row">
                    <span>Homestay</span>
                    <strong>{hs.name}</strong>
                  </div>
                  <div className="success-row">
                    <span>Check-in</span>
                    <strong>{new Date(form.checkin).toLocaleDateString('en-MY', {day:'numeric', month:'long', year:'numeric'})}</strong>
                  </div>
                  <div className="success-row">
                    <span>Check-out</span>
                    <strong>{new Date(form.checkout).toLocaleDateString('en-MY', {day:'numeric', month:'long', year:'numeric'})}</strong>
                  </div>
                  <div className="success-row">
                    <span>Total Paid</span>
                    <strong>RM {totalPrice}</strong>
                  </div>
                  <div className="success-row">
                    <span>Status</span>
                    <span className="status-badge pending">⏳ Pending</span>
                  </div>
                </div>

                <div className="success-actions">
                  <Link to="/my-bookings" className="btn-next">View My Bookings</Link>
                  <Link to="/" className="btn-back">Back to Home</Link>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — SUMMARY */}
          {step !== 3 && (
            <div className="booking-summary">
              <div className="summary-card">
                <img src={`/images/${hs.image}`} alt={hs.name}
                  onError={e => e.target.src = `https://placehold.co/400x240/e8f4f8/1a5276?text=${encodeURIComponent(hs.name)}`} />
                <div className="summary-body">
                  <h3>{hs.name}</h3>
                  <p className="summary-location">📍 {hs.location}</p>
                  <p className="summary-rating">⭐ {hs.rating}</p>

                  <div className="summary-divider"></div>

                  <div className="summary-row">
                    <span>RM {Math.round(hs.price_per_night)} x {nights} night{nights !== 1 ? 's' : ''}</span>
                    <strong>RM {totalPrice}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Guests</span>
                    <strong>{form.guests}</strong>
                  </div>

                  {form.checkin && form.checkout && (
                    <>
                      <div className="summary-divider"></div>
                      <div className="summary-row">
                        <span>Check-in</span>
                        <strong>{form.checkin}</strong>
                      </div>
                      <div className="summary-row">
                        <span>Check-out</span>
                        <strong>{form.checkout}</strong>
                      </div>
                    </>
                  )}

                  <div className="summary-divider"></div>
                  <div className="summary-total">
                    <span>Total</span>
                    <strong>RM {totalPrice}</strong>
                  </div>
                </div>
              </div>

              <div className="summary-note">
                🔒 Your booking is secure. Payment confirmed within 24 hours.
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Booking;