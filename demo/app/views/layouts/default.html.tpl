<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<title><?php echo htmlspecialchars($rox_page_title); ?></title>
	<?php echo $html->favicon(); ?>
</head>
<body>
	<div id="wrapper">
		<?php echo $this->element('header'); ?>
		<div id="container">
			<?php foreach ($this->getFlashMessages() as $type => $message) : ?>
				<div class="flash-message <?php echo $type ?>-flash-message">
					<?php echo htmlspecialchars($message); ?>
				</div>
			<?php endforeach; ?>
			<?php echo $rox_layout_content; ?>
		</div>
		<?php echo $this->element('footer'); ?>
	</div>
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.6/jquery.min.js"></script>
	<script type="text/javascript" src="../../../history.js"></script>	
	<script type="text/javascript" src="../../../mAjax.js"></script>
	<script type="text/javascript" src="../../../mAjaxAuto.js"></script>
</body>
</html>
