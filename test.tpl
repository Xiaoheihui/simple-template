<ul>
	<% if (this.show) { %>
		<% for (let i = 0; i < this.languages.length; i++) { %>
			<li>
				<%= this.languages[i] %>
			</li>
		<% } %>
	<% } else { %>
		<p>无</p>
	<% } %>
</ul>

