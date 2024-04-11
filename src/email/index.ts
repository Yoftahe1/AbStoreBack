export function driverAdd(email: string, password: string) {
  return {
    from: "AB STORE",
    to: email,
    subject: "You Have Been Added To Ab Store.",
    html: `<div>
                <div style="background-color:#0077BD; color:white; padding:5px; text-align:center;border-radius:10px; ">
                    <h2 >Welcome To Ab Store</h2>
                </div>
                <div style="padding:5px;">
                    <p>You have been add as a driver to Ab store.Your sign in credentials are listed below</p>
                    <div>
                        <label style="font-weight:bold">Email: </label>
                        <p>${email}</p>
                    </div>
                    <div>
                        <label style="font-weight:bold">Password: </label>
                        <p>${password}</p>
                    </div>
                </div>
           </div>`,
  };
}

export function adminAdd(email: string, password: string) {
  return {
    from: "AB STORE",
    to: email,
    subject: "You Have Been Added To Ab Store.",
    html: `<div>
                <div style="background-color:#0077BD; color:white; padding:5px; text-align:center;border-radius:10px; ">
                    <h2 >Welcome To Ab Store</h2>
                </div>
                <div style="padding:5px;">
                    <p>You have been add as a admin to Ab store.Your sign in credentials are listed below</p>
                    <div>
                        <label style="font-weight:bold">Email: </label>
                        <p>${email}</p>
                    </div>
                    <div>
                        <label style="font-weight:bold">Password: </label>
                        <p>${password}</p>
                  </div>
                </div>
           </div>`,
  };
}

export function forgotPassword(email: string, password: string) {
  return {
    from: "AB STORE",
    to: email,
    subject: "One Time Password.",
    html: `<div>
                  <div style="background-color:#0077BD; color:white; padding:5px; text-align:center;border-radius:10px; ">
                      <h2 >Forgot Password</h2>
                  </div>
                  <div style="padding:5px;">
                      <p>Your one time password will only work for the next one hour only.Your one time password is listed below</p>
                      <div>
                          <label style="font-weight:bold">Password: </label>
                          <p>${password}</p>
                    </div>
                  </div>
             </div>`,
  };
}

export function orderVerification(email: string, key: string) {
  return {
    from: "AB STORE",
    to: email,
    subject: "Order Verification Key.",
    html: `<div>
                  <div style="background-color:#0077BD; color:white; padding:5px; text-align:center;border-radius:10px; ">
                      <h2 >Order Verification Key</h2>
                  </div>
                  <div style="padding:5px;">
                      <p>use order verification key to receive your delivery.Your order verification is listed below</p>
                      <div>
                          <label style="font-weight:bold">Order Verification Key: </label>
                          <p>${key}</p>
                    </div>
                  </div>
             </div>`,
  };
}
