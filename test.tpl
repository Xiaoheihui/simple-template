<ul>
	<% if (this.show) { %>
		<% for (var i = 0; i < this.users.length; i++) { %>
			<li>
				<a href="<%= this.users[i].url %>">
					<%= this.users[i].name %>
				</a>
			</li>
		<% } %>
	<% } else { %>
		<p>不展示列表</p>
	<% } %>
</ul>