<?php
// Rename to config.php. NEVER commit your actual admin secret.
return [
 'admin_token' => 'CHANGE_ME_TO_A_LONG_RANDOM_SECRET_OF_AT_LEAST_24_CHARS',
 // For non-Apache hosting set an absolute storage path outside public_html.
 'storage_dir' => __DIR__ . '/storage',
];
