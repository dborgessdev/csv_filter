<?php

class SiteController extends Controller
{
    public function actionUpload()
    {
        header('Content-Type: application/json');
        $errors = [];
        $rowNumber = 3;

        if (isset($_FILES['csv_file'])) {
            $file = CUploadedFile::getInstanceByName('csv_file');

            if ($file && $file->getExtensionName() === 'csv') {
                $filePath = Yii::getPathOfAlias('webroot') . '/uploads/' . $file->getName();

                if ($file->saveAs($filePath)) {
                    $data = [];
                    if (($handle = fopen($filePath, 'r')) !== false) {
                        fgetcsv($handle, 1000, ",");
                        fgetcsv($handle, 1000, ",");

                        while (($row = fgetcsv($handle, 1000, ",")) !== false) {
                            if (!$this->validateRow($row, $errors, $rowNumber)) {
                                foreach ($errors as &$error) {
                                    $error = "Linha $rowNumber: $error";
                                }
                            }
                            $data[] = $row;
                            $rowNumber++;
                        }
                        fclose($handle);
                    }
                    echo json_encode(empty($errors) ? $data : ['errors' => $errors]);
                    Yii::app()->end();
                } else {
                    echo json_encode(['error' => 'Falha ao salvar o arquivo.']);
                }
            } else {
                echo json_encode(['error' => 'Arquivo CSV inválido.']);
            }
        } else {
            echo json_encode(['error' => 'Nenhum arquivo foi enviado.']);
        }
    }

    private function validateRow($row, &$errors, $rowNumber)
    {
        $errorPrefix = "Linha $rowNumber: ";
        $cpf = trim($row[7]);
        $cnpj = trim($row[6]);
        $hasCnpj = !empty($cnpj) && preg_match('/^\d{14}$/', str_replace(['.', '/', '-'], '', $cnpj));
        $hasCpf = !empty($cpf) && preg_match('/^\d{11}$/', str_replace(['.', '-', ' '], '', $cpf));

        if (empty($cpf) && empty($cnpj)) {
            $errors[] = $errorPrefix . "CNPJ ou CPF é obrigatório.";
        } elseif (!$hasCnpj && !empty($cnpj)) {
            $errors[] = $errorPrefix . "CNPJ inválido: " . $cnpj;
        } elseif (!$hasCpf && !empty($cpf)) {
            $errors[] = $errorPrefix . "CPF inválido: " . $cpf;
        }

        if (empty($row[1])) {
            $errors[] = $errorPrefix . "O dia de vencimento é obrigatório.";
        } elseif ($row[1] < 1 || $row[1] > 31) {
            $errors[] = $errorPrefix . "O dia de vencimento deve ser entre 1 e 31.";
        }

        $emails = explode(';', $row[10]);
        foreach ($emails as $email) {
            if (!filter_var(trim($email), FILTER_VALIDATE_EMAIL)) {
                $errors[] = $errorPrefix . "E-mail de financeiro inválido: " . trim($email);
            }
        }

        return empty($errors);
    }

    public function actionIndex()
    {
        $this->render('upload');
    }

    public function actionError()
    {
        if ($error = Yii::app()->errorHandler->error) {
            if (Yii::app()->request->isAjaxRequest)
                echo $error['message'];
            else
                $this->render('error', $error);
        }
    }
}
