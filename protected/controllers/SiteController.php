<?php

class SiteController extends Controller
{
	public function actionUpload()
	{
		header('Content-Type: application/json'); // Define o tipo de conteúdo como JSON
		$errors = []; // Para armazenar erros de validação
		$rowNumber = 3; // Começa a contagem de linhas a partir de 3

		if (isset($_FILES['csv_file'])) {
			$file = CUploadedFile::getInstanceByName('csv_file');

			if ($file && $file->getExtensionName() === 'csv') {
				$filePath = Yii::getPathOfAlias('webroot') . '/uploads/' . $file->getName();

				if ($file->saveAs($filePath)) { 
					$data = [];
					if (($handle = fopen($filePath, 'r')) !== false) {
						fgetcsv($handle, 1000, ","); // Lê e ignora a primeira linha (cabeçalho)
						fgetcsv($handle, 1000, ","); // Lê e ignora a segunda linha (instruções)

						while (($row = fgetcsv($handle, 1000, ",")) !== false) {
							// Valida os dados
							if (!$this->validateRow($row, $errors, $rowNumber)) {
								// Adiciona o número da linha ao erro
								foreach ($errors as &$error) {
									$error = "Linha $rowNumber: $error";
								}
							}
							$data[] = $row; // Armazena os dados CSV
							$rowNumber++; // Incrementa o número da linha
						}
						fclose($handle);
					}
					// Retorna dados ou erros de validação
					if (!empty($errors)) {
						echo json_encode(['errors' => $errors]);
					} else {
						echo json_encode($data); // Envia os dados CSV como JSON
					}
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
		
		$cpf = trim($row[7]); // CPF
		$cnpj = trim($row[6]); // CNPJ
		$hasCnpj = !empty($cnpj) && preg_match('/^\d{14}$/', str_replace(['.', '/', '-'], '', $cnpj));
		$hasCpf = !empty($cpf) && preg_match('/^\d{11}$/', str_replace(['.', '-', ' '], '', $cpf));

		// Verifica se ambos estão vazios
		if (empty($cpf) && empty($cnpj)) {
			$errors[] = $errorPrefix . "CNPJ ou CPF é obrigatório.";
		} elseif (!$hasCnpj && !empty($cnpj)) {
			$errors[] = $errorPrefix . "CNPJ inválido: " . $cnpj;
		} elseif (!$hasCpf && !empty($cpf)) {
			$errors[] = $errorPrefix . "CPF inválido: " . $cpf;
		}

		// Valida o dia de vencimento
		if (empty($row[1])) { // Campo "Dia de vencimento"
			$errors[] = $errorPrefix . "O dia de vencimento é obrigatório.";
		} elseif ($row[1] < 1 || $row[1] > 31) {
			$errors[] = $errorPrefix . "O dia de vencimento deve ser entre 1 e 31.";
		}

		// Valida e-mail
		$emails = explode(';', $row[10]); // Considera múltiplos e-mails separados por ponto e vírgula
		foreach ($emails as $email) {
			if (!filter_var(trim($email), FILTER_VALIDATE_EMAIL)) {
				$errors[] = $errorPrefix . "E-mail de financeiro inválido: " . trim($email);
			}
		}

		return empty($errors);
	}
    public function actions()
    {
        return array(
            'captcha' => array(
                'class' => 'CCaptchaAction',
                'backColor' => 0xFFFFFF,
            ),
            'page' => array(
                'class' => 'CViewAction',
            ),
        );
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

    public function actionContact()
    {
        $model = new ContactForm;
        if (isset($_POST['ContactForm'])) {
            $model->attributes = $_POST['ContactForm'];
            if ($model->validate()) {
                $name = '=?UTF-8?B?' . base64_encode($model->name) . '?=';
                $subject = '=?UTF-8?B?' . base64_encode($model->subject) . '?=';
                $headers = "From: $name <{$model->email}>\r\n" .
                           "Reply-To: {$model->email}\r\n" .
                           "MIME-Version: 1.0\r\n" .
                           "Content-Type: text/plain; charset=UTF-8";

                mail(Yii::app()->params['adminEmail'], $subject, $model->body, $headers);
                Yii::app()->user->setFlash('contact', 'Thank you for contacting us. We will respond to you as soon as possible.');
                $this->refresh();
            }
        }
        $this->render('contact', array('model' => $model));
    }

    public function actionLogin()
    {
        $model = new LoginForm;

        if (isset($_POST['ajax']) && $_POST['ajax'] === 'login-form') {
            echo CActiveForm::validate($model);
            Yii::app()->end();
        }

        if (isset($_POST['LoginForm'])) {
            $model->attributes = $_POST['LoginForm'];
            if ($model->validate() && $model->login())
                $this->redirect(Yii::app()->user->returnUrl);
        }
        $this->render('login', array('model' => $model));
    }

    public function actionLogout()
    {
        Yii::app()->user->logout();
        $this->redirect(Yii::app()->homeUrl);
    }
}
