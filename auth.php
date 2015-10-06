<?php
/**
 * @file
 * This is an example on authentication with the search node.
 *
 * It's done in the backend to prevent the API key (even it's read-only) to be
 * public available in the frontend.
 */

/**
 * Authenticates against the host with the apiKey
 *
 * @param $host
 *   The host to connect to https://localhost.
 * @param $apiKey
 *   The API-key to authenticate with.
 *
 * @return array
 *   With the connection status and auth token.
 */
function authenticate($host, $apiKey) {
  // Build query.
  $ch = curl_init($host . '/authenticate');

  // SSL fix  for self signed.
  curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);

  curl_setopt($ch, CURLOPT_POST, TRUE);
  curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
  curl_setopt($ch, CURLOPT_POSTFIELDS,
    json_encode(
      array(
        'apikey' => $apiKey
      )
    )
  );
  curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/json'
  ));

  // Receive server response.
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  $content = curl_exec($ch);
  $http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);

  // Close connection.
  curl_close($ch);

  return array(
    'status' => $http_status,
    'token' => json_decode($content)->token,
  );
}

header('Content-type: application/json');
echo json_encode(authenticate('https://search.node.vm', '795359dd2c81fa41af67faa2f9adbd32'));
