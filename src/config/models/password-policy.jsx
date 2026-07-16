// Mirrors the policy enforced server-side in auth-service (validatePasswordPolicy.js) - kept here
// as the single place both the hint text and the pre-submit check are built from, so the three
// password forms (register, change-password, reset-password) never drift from one another.
const SPECIAL_CHARS = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';

export const PASSWORD_POLICY_REGEX = new RegExp(
	'^(?=.*[A-Z])(?=.*\\d)(?=.*[' + SPECIAL_CHARS.split('').map((ch) => '\\' + ch).join('') + ']).{8,}$'
);

export const PASSWORD_POLICY_HINT =
	`Must be at least 8 characters, with at least one uppercase letter, one number, and one special character (${SPECIAL_CHARS}).`;

export const isPasswordCompliant = (password) => PASSWORD_POLICY_REGEX.test(password || '');
