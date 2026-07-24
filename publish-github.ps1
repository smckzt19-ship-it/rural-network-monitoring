$ErrorActionPreference = "Stop"

function Invoke-Git {
  param(
    [Parameter(Mandatory = $true)]
    [string]$GitPath,
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Arguments
  )

  & $GitPath @Arguments
  if ($LASTEXITCODE -ne 0) {
    $safeArguments = $Arguments | ForEach-Object {
      if ($_ -like "http.extraHeader=*") {
        "http.extraHeader=<redacted>"
      } else {
        $_
      }
    }
    throw "Git command failed: git $($safeArguments -join ' ')"
  }
}

$owner = "smckzt19-ship-it"
$defaultRepo = "rural-network-monitoring"
$repo = Read-Host "Repository name [$defaultRepo]"
if ([string]::IsNullOrWhiteSpace($repo)) {
  $repo = $defaultRepo
}

$secureToken = Read-Host "GitHub classic token" -AsSecureString
$tokenPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)
$token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($tokenPtr)
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($tokenPtr)

try {
  $headers = @{
    Authorization = "Bearer $token"
    Accept = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
  }

  $currentUser = Invoke-RestMethod -Method Get -Uri "https://api.github.com/user" -Headers $headers
  Write-Host "Token account: $($currentUser.login)"
  if ($currentUser.login -ne $owner) {
    throw "This token belongs to '$($currentUser.login)', but the script is configured for '$owner'. Use a token from '$owner' or update the owner variable."
  }
  $basicAuthBytes = [Text.Encoding]::ASCII.GetBytes("x-access-token:$token")
  $basicAuth = [Convert]::ToBase64String($basicAuthBytes)
  $authHeader = "AUTHORIZATION: basic $basicAuth"

  $repoUrl = "https://api.github.com/repos/$owner/$repo"
  $createdRepo = $null
  try {
    $createdRepo = Invoke-RestMethod -Method Get -Uri $repoUrl -Headers $headers
    Write-Host "Repository already exists: $owner/$repo"
  } catch {
    $body = @{
      name = $repo
      private = $false
      description = "Dashboard for monitoring rural network construction"
      auto_init = $false
    } | ConvertTo-Json

    $createdRepo = Invoke-RestMethod -Method Post -Uri "https://api.github.com/user/repos" -Headers $headers -Body $body -ContentType "application/json"
    Write-Host "Repository created: $($createdRepo.full_name)"
  }

  $gitCandidates = @(
    "C:\Program Files\Git\cmd\git.exe",
    "git",
    "C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe"
  )
  $git = $gitCandidates | Where-Object {
    try {
      & $_ --version | Out-Null
      $true
    } catch {
      $false
    }
  } | Select-Object -First 1

  if (-not $git) {
    throw "Git executable was not found."
  }

  $remoteList = & $git --git-dir=".repo-git" --work-tree="." remote
  if ($remoteList -contains "origin") {
    Invoke-Git $git --git-dir=".repo-git" --work-tree="." remote remove origin
  }
  Invoke-Git $git --git-dir=".repo-git" --work-tree="." remote add origin "https://github.com/$owner/$repo.git"
  $env:GIT_TERMINAL_PROMPT = "0"
  $env:GCM_INTERACTIVE = "Never"
  Invoke-Git $git --git-dir=".repo-git" --work-tree="." -c "http.extraHeader=$authHeader" push -u origin main

  $remoteHeads = & $git --git-dir=".repo-git" --work-tree="." -c "http.extraHeader=$authHeader" ls-remote --heads origin main
  if (-not $remoteHeads) {
    throw "The push finished, but GitHub does not show the main branch yet."
  }

  try {
    $pagesBody = @{
      source = @{
        branch = "main"
        path = "/"
      }
    } | ConvertTo-Json -Depth 4

    Invoke-RestMethod -Method Post -Uri "https://api.github.com/repos/$owner/$repo/pages" -Headers $headers -Body $pagesBody -ContentType "application/json" | Out-Null
    Write-Host "GitHub Pages enabled."
  } catch {
    Write-Host "GitHub Pages may already be enabled or GitHub is still processing the first push."
  }

  Write-Host ""
  Write-Host "Repository: $($createdRepo.html_url)"
  Write-Host "Site:       https://$owner.github.io/$repo/"
} finally {
  $token = $null
}
