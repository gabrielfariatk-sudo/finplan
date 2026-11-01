@echo off
rem Inicia o FinPlan em modo de uso (produção local). Acesse http://localhost:3000
rem Dica: coloque um atalho deste arquivo em shell:startup para iniciar com o Windows.
cd /d "%~dp0"
if not exist ".next\BUILD_ID" (
  echo Primeira execucao: compilando o FinPlan...
  call npm run build
  if errorlevel 1 (
    echo Falha ao compilar. Veja as mensagens acima.
    pause
    exit /b 1
  )
)
echo FinPlan rodando em http://localhost:3000  (feche esta janela para parar)
call npm start
pause
